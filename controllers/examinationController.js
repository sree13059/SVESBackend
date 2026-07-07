const Examination = require('../models/Examination');
const Result = require('../models/Result');

const createExamination = async (req, res) => {
  try {
    const exam = await Examination.create(req.body);
    res.status(201).json(exam);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const getExaminations = async (req, res) => {
  try {
    const exams = await Examination.find().sort({ createdAt: -1 });
    res.status(200).json(exams);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateExamination = async (req, res) => {
  try {
    const exam = await Examination.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!exam) return res.status(404).json({ error: 'Examination not found' });
    res.status(200).json(exam);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const deleteExamination = async (req, res) => {
  try {
    const exam = await Examination.findByIdAndDelete(req.params.id);
    if (!exam) return res.status(404).json({ error: 'Examination not found' });
    
    // Cascading delete results associated with this exam
    await Result.deleteMany({ examinationId: req.params.id });
    
    res.status(200).json({ message: 'Examination and associated results deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createExamination,
  getExaminations,
  updateExamination,
  deleteExamination
};
