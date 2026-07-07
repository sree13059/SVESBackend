const express = require('express');
const {
  createAdmission,
  getAdmissions
} = require('../controllers/admissionController');

const router = express.Router();

router.route('/')
  .get(getAdmissions)
  .post(createAdmission);

module.exports = router;
