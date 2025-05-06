const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Campaign title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Technology', 'Art', 'Food', 'Games', 'Education']
  },
  goal: {
    type: Number,
    required: [true, 'Funding goal is required'],
    min: [100, 'Goal must be at least $100']
  },
  pledged: {
    type: Number,
    default: 0
  },
  backers: {
    type: Number,
    default: 0
  },
  deadline: {
    type: Date,
    required: [true, 'Deadline is required']
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  imageUrl: {
    type: String,
    required: [true, 'Image URL is required']
  },
  status: {
    type: String,
    enum: ['active', 'successful', 'failed'],
    default: 'active'
  },
  rewards: [{
    title: String,
    description: String,
    minimumPledge: Number
  }]
}, {
  timestamps: true
});

campaignSchema.virtual('daysRemaining').get(function() {
  return Math.ceil((this.deadline - Date.now()) / (1000 * 60 * 60 * 24));
});

module.exports = mongoose.model('Campaign', campaignSchema);
