const ExamRegistration = require('../models/ExamRegistration');

const createExamRegistration = async (req, res) => {
  try {
    const registration = await ExamRegistration.create(req.body);
    res.status(201).json(registration);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const getExamRegistrations = async (req, res) => {
  try {
    const registrations = await ExamRegistration.find().sort({ createdAt: -1 });
    res.status(200).json(registrations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateExamRegistration = async (req, res) => {
  try {
    const registration = await ExamRegistration.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!registration) return res.status(404).json({ error: 'Registration not found' });
    res.status(200).json(registration);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const deleteExamRegistration = async (req, res) => {
  try {
    const registration = await ExamRegistration.findByIdAndDelete(req.params.id);
    if (!registration) return res.status(404).json({ error: 'Registration not found' });
    res.status(200).json({ message: 'Registration deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createExamRegistration,
  getExamRegistrations,
  updateExamRegistration,
  deleteExamRegistration
};
