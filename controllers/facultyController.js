const FacultyApplication = require('../models/FacultyApplication');

const createFacultyApplication = async (req, res) => {
  try {
    const application = await FacultyApplication.create(req.body);
    res.status(201).json(application);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const getFacultyApplications = async (req, res) => {
  try {
    const applications = await FacultyApplication.find().sort({ createdAt: -1 });
    res.status(200).json(applications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateFacultyApplication = async (req, res) => {
  try {
    const application = await FacultyApplication.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!application) return res.status(404).json({ error: 'Application not found' });
    res.status(200).json(application);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const deleteFacultyApplication = async (req, res) => {
  try {
    const application = await FacultyApplication.findByIdAndDelete(req.params.id);
    if (!application) return res.status(404).json({ error: 'Application not found' });
    res.status(200).json({ message: 'Application deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createFacultyApplication,
  getFacultyApplications,
  updateFacultyApplication,
  deleteFacultyApplication
};
