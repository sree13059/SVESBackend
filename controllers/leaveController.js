const Leave = require('../models/Leave');

const createLeave = async (req, res) => {
  try {
    const leave = await Leave.create(req.body);
    res.status(201).json(leave);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const getLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find().sort({ createdAt: -1 });
    res.status(200).json(leaves);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateLeaveStatus = async (req, res) => {
  try {
    const leave = await Leave.findOneAndUpdate(
      { id: req.params.id },
      { status: req.body.status },
      { new: true }
    );

    if (!leave) {
      return res.status(404).json({ error: 'Leave request not found' });
    }

    res.status(200).json(leave);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = {
  createLeave,
  getLeaves,
  updateLeaveStatus
};
