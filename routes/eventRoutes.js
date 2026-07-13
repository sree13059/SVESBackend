const express = require('express');
const {
  createEvent,
  getEvents,
  updateEvent,
  deleteEvent
} = require('../controllers/eventController');

const router = express.Router();

router.route('/')
  .get(getEvents)
  .post(createEvent);

router.route('/:id')
  .put(updateEvent)
  .delete(deleteEvent);

module.exports = router;
