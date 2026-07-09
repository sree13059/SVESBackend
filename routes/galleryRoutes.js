const express = require('express');
const {
  getGalleryItems,
  createGalleryItem,
  deleteGalleryItem
} = require('../controllers/galleryController');

const router = express.Router();

router.route('/')
  .get(getGalleryItems)
  .post(createGalleryItem);

router.route('/:id')
  .delete(deleteGalleryItem);

module.exports = router;
