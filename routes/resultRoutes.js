const express = require('express');
const {
  createResult,
  getResults,
  updateResult,
  deleteResult
} = require('../controllers/resultController');

const router = express.Router();

router.route('/')
  .get(getResults)
  .post(createResult);

router.route('/:id')
  .put(updateResult)
  .delete(deleteResult);

module.exports = router;
