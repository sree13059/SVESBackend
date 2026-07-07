const express = require('express');
const {
  createLeave,
  getLeaves,
  updateLeaveStatus
} = require('../controllers/leaveController');

const router = express.Router();

router.route('/')
  .get(getLeaves)
  .post(createLeave);

router.put('/:id', updateLeaveStatus);

module.exports = router;
