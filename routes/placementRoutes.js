const express = require('express');
const {
  createPlacementEnquiry,
  getPlacementEnquiries,
  updatePlacementEnquiry,
  deletePlacementEnquiry
} = require('../controllers/placementController');

const router = express.Router();

router.route('/')
  .get(getPlacementEnquiries)
  .post(createPlacementEnquiry);

router.route('/:id')
  .put(updatePlacementEnquiry)
  .delete(deletePlacementEnquiry);

module.exports = router;
