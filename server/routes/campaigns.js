const express = require('express');
const router = express.Router();
const Campaign = require('../models/Campaign');


router.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json');
  next();
});

// Get all campaigns with filtering
router.get('/', async (req, res) => {
  try {
    const campaigns = await Campaign.find().limit(12);
    res.json({ 
      success: true,
      data: campaigns 
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
});

// Get campaign stats
router.get('/stats', async (req, res) => {
  try {
    const totalRaised = await Campaign.aggregate([
      { $group: { _id: null, total: { $sum: "$raisedAmount" } } }
    ]);
    
    const stats = {
      totalRaised: totalRaised[0]?.total || 0,
      totalBackers: await Campaign.aggregate([
        { $group: { _id: null, total: { $sum: "$backers" } } }
      ]).then(res => res[0]?.total || 0),
      totalProjects: await Campaign.countDocuments()
    };

    res.json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
