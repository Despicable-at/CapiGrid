const express = require('express');
const router = express.Router();
const Campaign = require('../models/Campaign');

// Get all campaigns with filtering
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    const query = {};
    
    if (category && category !== 'All') {
      query.category = category;
    }
    
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const campaigns = await Campaign.find(query)
      .sort({ createdAt: -1 })
      .limit(12);
      
    res.json({ success: true, data: campaigns });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
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
