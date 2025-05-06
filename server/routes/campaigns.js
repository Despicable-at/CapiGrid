const express = require('express');
const Campaign = require('../models/Campaign'); // adjust path as needed

const router = express.Router();

// Example GET route
router.get('/', async (req, res) => {
  try {
    const campaigns = await Campaign.find();
    res.status(200).json({ success: true, data: campaigns });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Add more CRUD routes (POST, PUT, DELETE) as needed

module.exports = router;
