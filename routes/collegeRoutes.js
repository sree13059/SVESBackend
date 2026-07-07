const express = require('express');
const {
  createCollege,
  getColleges,
  getCollegeById,
  updateCollege,
  deleteCollege
} = require('../controllers/collegeController');

const router = express.Router();

router.route('/')
  .get(getColleges)
  .post(createCollege);

router.route('/:id')
  .get(getCollegeById)
  .put(updateCollege)
  .delete(deleteCollege);

module.exports = router;
