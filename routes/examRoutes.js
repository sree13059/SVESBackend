const express = require('express');
const {
  createExamRegistration,
  getExamRegistrations,
  updateExamRegistration,
  deleteExamRegistration
} = require('../controllers/examController');

const router = express.Router();

router.route('/')
  .get(getExamRegistrations)
  .post(createExamRegistration);

router.route('/:id')
  .put(updateExamRegistration)
  .delete(deleteExamRegistration);

module.exports = router;
