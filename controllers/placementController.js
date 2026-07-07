const PlacementEnquiry = require('../models/PlacementEnquiry');

const createPlacementEnquiry = async (req, res) => {
  try {
    const enquiry = await PlacementEnquiry.create(req.body);
    res.status(201).json(enquiry);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const getPlacementEnquiries = async (req, res) => {
  try {
    const enquiries = await PlacementEnquiry.find().sort({ createdAt: -1 });
    res.status(200).json(enquiries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updatePlacementEnquiry = async (req, res) => {
  try {
    const enquiry = await PlacementEnquiry.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!enquiry) return res.status(404).json({ error: 'Placement registration not found' });
    res.status(200).json(enquiry);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const deletePlacementEnquiry = async (req, res) => {
  try {
    const enquiry = await PlacementEnquiry.findByIdAndDelete(req.params.id);
    if (!enquiry) return res.status(404).json({ error: 'Placement registration not found' });
    res.status(200).json({ message: 'Placement registration deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createPlacementEnquiry,
  getPlacementEnquiries,
  updatePlacementEnquiry,
  deletePlacementEnquiry
};
