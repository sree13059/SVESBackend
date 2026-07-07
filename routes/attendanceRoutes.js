const express = require('express');
const {
  createAttendance,
  getAttendance,
  updateAttendance,
  deleteAttendance
} = require('../controllers/attendanceController');

const router = express.Router();

router.route('/')
  .get(getAttendance)
  .post(createAttendance);

router.route('/:id')
  .put(updateAttendance)
  .delete(deleteAttendance);

module.exports = router;
