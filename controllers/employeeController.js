const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const fs = require('fs');
const path = require('path');

const saveBase64File = (base64String, prefix = 'file') => {
  if (!base64String || typeof base64String !== 'string' || !base64String.startsWith('data:')) {
    return base64String;
  }

  try {
    const matches = base64String.match(/^data:([^;]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return base64String;
    }

    const mimeType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');

    let extension = 'bin';
    let subfolder = 'files'; // Default to files folder (resumes, pdfs, docs)

    if (mimeType.includes('png')) { extension = 'png'; subfolder = 'photos'; }
    else if (mimeType.includes('jpeg') || mimeType.includes('jpg')) { extension = 'jpg'; subfolder = 'photos'; }
    else if (mimeType.includes('gif')) { extension = 'gif'; subfolder = 'photos'; }
    else if (mimeType.includes('pdf')) { extension = 'pdf'; subfolder = 'files'; }
    else if (mimeType.includes('plain')) { extension = 'txt'; subfolder = 'files'; }
    else if (mimeType.includes('word') || mimeType.includes('msword')) { extension = 'doc'; subfolder = 'files'; }
    else if (mimeType.includes('officedocument.wordprocessingml')) { extension = 'docx'; subfolder = 'files'; }

    // Enforce photos folder if prefix specifies avatar/photo
    if (prefix.toLowerCase().includes('avatar') || prefix.toLowerCase().includes('photo')) {
      subfolder = 'photos';
    }

    const filename = `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1000)}.${extension}`;
    const uploadsDir = path.join(__dirname, '..', 'uploads', subfolder);

    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filePath = path.join(uploadsDir, filename);
    fs.writeFileSync(filePath, buffer);

    return `/uploads/${subfolder}/${filename}`;
  } catch (err) {
    console.error('Error saving base64 file:', err);
    return base64String;
  }
};

const createEmployee = async (req, res) => {
  try {
    if (req.body.avatar) {
      req.body.avatar = saveBase64File(req.body.avatar, 'avatar');
    }
    if (req.body.document) {
      req.body.document = saveBase64File(req.body.document, 'doc');
    }
    const employee = await Employee.create(req.body);
    res.status(201).json(employee);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 });
    res.status(200).json(employees);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateEmployee = async (req, res) => {
  try {
    if (req.body.avatar) {
      req.body.avatar = saveBase64File(req.body.avatar, 'avatar');
    }
    if (req.body.document) {
      req.body.document = saveBase64File(req.body.document, 'doc');
    }
    const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!employee) return res.status(404).json({ error: 'Employee not found' });
    res.status(200).json(employee);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) return res.status(404).json({ error: 'Employee not found' });
    
    // Clean up related attendance and leave records for this employee ID
    await Attendance.deleteMany({ empId: employee.id });
    await Leave.deleteMany({ empId: employee.id });

    res.status(200).json({ message: 'Employee deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createEmployee,
  getEmployees,
  updateEmployee,
  deleteEmployee
};
