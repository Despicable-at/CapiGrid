const mongoose = require('mongoose');

const CampaignSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { 
    type: String, 
    required: true,
    enum: ['Education', 'Film & Video', 'Community', 'Food', 'Games', 'Technology', 'Business']
  },
  goalAmount: { type: Number, required: true },
  raisedAmount: { type: Number, default: 0 },
  backers: { type: Number, default: 0 },
  imageUrl: { type: String, default: '/default-campaign.jpg' },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rewards: [{
    tier: String,
    description: String,
    amount: Number
  }],
  endDate: { type: Date, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Campaign', CampaignSchema);
