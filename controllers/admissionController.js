const Admission = require('../models/Admission');

const createAdmission = async (req, res) => {
  try {
    const admission = await Admission.create(req.body);
    res.status(201).json(admission);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const getAdmissions = async (req, res) => {
  try {
    const admissions = await Admission.find().sort({ createdAt: -1 });
    res.status(200).json(admissions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createAdmission,
  getAdmissions
};
