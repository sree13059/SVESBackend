const express = require('express');
const {
  createEvent,
  getEvents
} = require('../controllers/eventController');

const router = express.Router();

router.route('/')
  .get(getEvents)
  .post(createEvent);

module.exports = router;
