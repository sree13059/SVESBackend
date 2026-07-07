const express = require('express');
const {
  createContact,
  getContacts
} = require('../controllers/contactController');

const router = express.Router();

router.route('/')
  .get(getContacts)
  .post(createContact);

module.exports = router;
