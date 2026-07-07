const express = require('express');
const {
  createStudent,
  getStudents,
  updateStudent,
  deleteStudent
} = require('../controllers/studentController');

const router = express.Router();

router.route('/')
  .get(getStudents)
  .post(createStudent);

router.route('/:id')
  .put(updateStudent)
  .delete(deleteStudent);

module.exports = router;
