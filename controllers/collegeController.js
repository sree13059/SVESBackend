const College = require('../models/College');

const createCollege = async (req, res) => {
  try {
    const college = await College.create(req.body);
    res.status(201).json(college);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const getColleges = async (req, res) => {
  try {
    const colleges = await College.find().sort({ name: 1 });
    res.status(200).json(colleges);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getCollegeById = async (req, res) => {
  try {
    const college = await College.findOne({ id: req.params.id });
    if (!college) return res.status(404).json({ error: 'College not found' });
    res.status(200).json(college);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateCollege = async (req, res) => {
  try {
    // Can match by mongodb _id OR custom 'id' field
    let college = await College.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    if (!college) {
      college = await College.findByIdAndUpdate(req.params.id, req.body, { new: true });
    }
    if (!college) return res.status(404).json({ error: 'College not found' });
    res.status(200).json(college);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const deleteCollege = async (req, res) => {
  try {
    let college = await College.findOneAndDelete({ id: req.params.id });
    if (!college) {
      college = await College.findByIdAndDelete(req.params.id);
    }
    if (!college) return res.status(404).json({ error: 'College not found' });
    res.status(200).json({ message: 'College deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createCollege,
  getColleges,
  getCollegeById,
  updateCollege,
  deleteCollege
};
