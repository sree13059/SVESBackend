const express = require('express');
const {
  createExamination,
  getExaminations,
  updateExamination,
  deleteExamination
} = require('../controllers/examinationController');

const router = express.Router();

router.route('/')
  .get(getExaminations)
  .post(createExamination);

router.route('/:id')
  .put(updateExamination)
  .delete(deleteExamination);

module.exports = router;
