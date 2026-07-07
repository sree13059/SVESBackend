const express = require('express');
const {
  createFacultyApplication,
  getFacultyApplications,
  updateFacultyApplication,
  deleteFacultyApplication
} = require('../controllers/facultyController');

const router = express.Router();

router.route('/')
  .get(getFacultyApplications)
  .post(createFacultyApplication);

router.route('/:id')
  .put(updateFacultyApplication)
  .delete(deleteFacultyApplication);

module.exports = router;
