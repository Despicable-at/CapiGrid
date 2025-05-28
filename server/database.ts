import mongoose from 'mongoose';
import { log } from './vite';

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI environment variable is required');
}

export async function connectToDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    log('Connected to MongoDB successfully', 'database');
  } catch (error) {
    log(`Failed to connect to MongoDB: ${error}`, 'database');
    throw error;
  }
}

// MongoDB Models
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fullName: { type: String, required: true },
  avatar: String,
  bio: String,
  isCreator: { type: Boolean, default: false },
  isAdmin: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  icon: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  projectCount: { type: Number, default: 0 },
});

const campaignSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  shortDescription: { type: String, required: true },
  goalAmount: { type: String, required: true },
  currentAmount: { type: String, default: "0" },
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  type: { type: String, enum: ["reward", "donation", "equity"], required: true },
  status: { type: String, enum: ["draft", "active", "funded", "cancelled", "ended"], default: "draft" },
  image: { type: String, required: true },
  gallery: [String],
  endDate: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  backerCount: { type: Number, default: 0 },
  featured: { type: Boolean, default: false },
  adminApproved: { type: Boolean, default: false },
  adminNotes: String,
});

const rewardSchema = new mongoose.Schema({
  campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  amount: { type: String, required: true },
  limitedQuantity: Number,
  claimed: { type: Number, default: 0 },
  estimatedDelivery: String,
});

const contributionSchema = new mongoose.Schema({
  campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: String, required: true },
  rewardId: { type: mongoose.Schema.Types.ObjectId, ref: 'Reward' },
  message: String,
  anonymous: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const campaignUpdateSchema = new mongoose.Schema({
  campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const User = mongoose.model('User', userSchema);
export const Category = mongoose.model('Category', categorySchema);
export const Campaign = mongoose.model('Campaign', campaignSchema);
export const Reward = mongoose.model('Reward', rewardSchema);
export const Contribution = mongoose.model('Contribution', contributionSchema);
export const CampaignUpdate = mongoose.model('CampaignUpdate', campaignUpdateSchema);

// Seed initial data
export async function seedDatabase() {
  try {
    // Check if data already exists
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      log('Database already seeded', 'database');
      return;
    }

    // Seed categories
    const categories = await Category.insertMany([
      { name: "Technology", icon: "fas fa-laptop-code", slug: "technology" },
      { name: "Art & Design", icon: "fas fa-paint-brush", slug: "art-design" },
      { name: "Games", icon: "fas fa-gamepad", slug: "games" },
      { name: "Health", icon: "fas fa-heartbeat", slug: "health" },
      { name: "Education", icon: "fas fa-graduation-cap", slug: "education" },
      { name: "Environment", icon: "fas fa-leaf", slug: "environment" },
    ]);

    // Seed admin user
    const adminUser = await User.create({
      username: "admin",
      email: "admin@capigrid.com",
      password: "admin123",
      fullName: "Platform Administrator",
      bio: "Capigrid Platform Administrator",
      isCreator: true,
      isAdmin: true,
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    });

    // Seed regular users
    const users = await User.insertMany([
      {
        username: "alexchen",
        email: "alex@example.com",
        password: "password123",
        fullName: "Alex Chen",
        bio: "Tech Entrepreneur passionate about AI and mobile technology",
        isCreator: true,
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
      },
      {
        username: "sarahjohnson",
        email: "sarah@example.com",
        password: "password123",
        fullName: "Sarah Johnson",
        bio: "Education Advocate working to improve access to learning resources",
        isCreator: true,
        avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&crop=face",
      },
      {
        username: "michaelrodriguez",
        email: "michael@example.com",
        password: "password123",
        fullName: "Michael Rodriguez",
        bio: "CEO & Founder of GreenPay, building sustainable fintech solutions",
        isCreator: true,
        avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop&crop=face",
      },
    ]);

    // Seed campaigns
    const campaigns = await Campaign.insertMany([
      {
        title: "Next-Gen Smartphone with AI Photography",
        shortDescription: "Revolutionary smartphone with built-in AI that takes professional-quality photos automatically",
        description: "Our revolutionary smartphone combines cutting-edge hardware with advanced AI algorithms to deliver professional-quality photography in your pocket. With features like real-time scene recognition, automatic lighting adjustment, and intelligent composition suggestions, every photo becomes a masterpiece.",
        goalAmount: "500000.00",
        currentAmount: "847392.00",
        creatorId: users[0]._id,
        categoryId: categories[0]._id,
        type: "reward",
        status: "active",
        image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=400&fit=crop",
        gallery: [
          "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=800&h=600&fit=crop",
        ],
        endDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
        backerCount: 2847,
        featured: true,
        adminApproved: true,
      },
      {
        title: "Books for Rural Schools Initiative",
        shortDescription: "Help us provide essential educational materials to underserved communities across rural areas",
        description: "Education is a fundamental right, yet many rural schools lack basic educational resources. Our initiative aims to provide comprehensive learning materials, including books, digital resources, and educational tools to schools in underserved areas. Every donation directly impacts a child's future.",
        goalAmount: "50000.00",
        currentAmount: "23847.00",
        creatorId: users[1]._id,
        categoryId: categories[4]._id,
        type: "donation",
        status: "active",
        image: "https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=800&h=400&fit=crop",
        gallery: [
          "https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=600&fit=crop",
        ],
        endDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
        backerCount: 487,
        featured: true,
        adminApproved: true,
      },
      {
        title: "GreenPay - Sustainable Digital Payments",
        shortDescription: "Revolutionary payment platform that plants trees with every transaction",
        description: "GreenPay is revolutionizing digital payments by making every transaction contribute to environmental restoration. Our platform combines seamless payment processing with automated tree planting, carbon offset tracking, and sustainability metrics. Join us in building a financial system that heals the planet.",
        goalAmount: "2000000.00",
        currentAmount: "1200000.00",
        creatorId: users[2]._id,
        categoryId: categories[0]._id,
        type: "equity",
        status: "active",
        image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=400&fit=crop",
        gallery: [
          "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=600&fit=crop",
        ],
        endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        backerCount: 247,
        featured: true,
        adminApproved: true,
      },
    ]);

    // Seed rewards for first campaign
    await Reward.insertMany([
      {
        campaignId: campaigns[0]._id,
        title: "Early Bird Special",
        description: "First 500 backers get 30% off the retail price plus exclusive early access",
        amount: "89.00",
        limitedQuantity: 500,
        claimed: 347,
        estimatedDelivery: "March 2025",
      },
      {
        campaignId: campaigns[0]._id,
        title: "Standard Package",
        description: "Complete smartphone with accessories and premium support",
        amount: "129.00",
        limitedQuantity: null,
        claimed: 1250,
        estimatedDelivery: "April 2025",
      },
      {
        campaignId: campaigns[0]._id,
        title: "Pro Bundle",
        description: "Smartphone + professional photography course + premium case",
        amount: "199.00",
        limitedQuantity: 200,
        claimed: 89,
        estimatedDelivery: "April 2025",
      },
    ]);

    log('Database seeded successfully', 'database');
  } catch (error) {
    log(`Failed to seed database: ${error}`, 'database');
  }
}
