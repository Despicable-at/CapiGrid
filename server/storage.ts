import {
  users,
  categories,
  campaigns,
  rewards,
  contributions,
  campaignUpdates,
  type User,
  type InsertUser,
  type Category,
  type InsertCategory,
  type Campaign,
  type InsertCampaign,
  type Reward,
  type InsertReward,
  type Contribution,
  type InsertContribution,
  type CampaignUpdate,
  type InsertCampaignUpdate,
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined>;

  // Categories
  getCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;

  // Campaigns
  getCampaigns(filters?: {
    status?: string;
    category?: string;
    featured?: boolean;
    creatorId?: number;
  }): Promise<Campaign[]>;
  getCampaign(id: number): Promise<Campaign | undefined>;
  createCampaign(campaign: InsertCampaign): Promise<Campaign>;
  updateCampaign(id: number, updates: Partial<InsertCampaign>): Promise<Campaign | undefined>;
  getCampaignsByCreator(creatorId: number): Promise<Campaign[]>;

  // Rewards
  getRewardsByCampaign(campaignId: number): Promise<Reward[]>;
  getReward(id: number): Promise<Reward | undefined>;
  createReward(reward: InsertReward): Promise<Reward>;
  updateReward(id: number, updates: Partial<InsertReward>): Promise<Reward | undefined>;

  // Contributions
  getContributionsByCampaign(campaignId: number): Promise<Contribution[]>;
  getContributionsByUser(userId: number): Promise<Contribution[]>;
  createContribution(contribution: InsertContribution): Promise<Contribution>;

  // Campaign Updates
  getUpdatesByCampaign(campaignId: number): Promise<CampaignUpdate[]>;
  createCampaignUpdate(update: InsertCampaignUpdate): Promise<CampaignUpdate>;

  // Analytics
  getStats(): Promise<{
    totalFunded: string;
    activeCampaigns: number;
    successfulProjects: number;
    totalBackers: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private categories: Map<number, Category> = new Map();
  private campaigns: Map<number, Campaign> = new Map();
  private rewards: Map<number, Reward> = new Map();
  private contributions: Map<number, Contribution> = new Map();
  private campaignUpdates: Map<number, CampaignUpdate> = new Map();

  private userIdCounter = 1;
  private categoryIdCounter = 1;
  private campaignIdCounter = 1;
  private rewardIdCounter = 1;
  private contributionIdCounter = 1;
  private updateIdCounter = 1;

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Seed categories
    const categoryData = [
      { name: "Technology", icon: "fas fa-laptop-code", slug: "technology" },
      { name: "Art & Design", icon: "fas fa-paint-brush", slug: "art-design" },
      { name: "Games", icon: "fas fa-gamepad", slug: "games" },
      { name: "Health", icon: "fas fa-heartbeat", slug: "health" },
      { name: "Education", icon: "fas fa-graduation-cap", slug: "education" },
      { name: "Environment", icon: "fas fa-leaf", slug: "environment" },
    ];

    categoryData.forEach(cat => {
      const id = this.categoryIdCounter++;
      this.categories.set(id, {
        id,
        ...cat,
        projectCount: Math.floor(Math.random() * 1000) + 100,
      });
    });

    // Seed users
    const userData = [
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
    ];

    userData.forEach(user => {
      const id = this.userIdCounter++;
      this.users.set(id, {
        id,
        ...user,
        createdAt: new Date(),
      });
    });

    // Seed campaigns
    const campaignData = [
      {
        title: "Next-Gen Smartphone with AI Photography",
        shortDescription: "Revolutionary smartphone with built-in AI that takes professional-quality photos automatically",
        description: "Our revolutionary smartphone combines cutting-edge hardware with advanced AI algorithms to deliver professional-quality photography in your pocket. With features like real-time scene recognition, automatic lighting adjustment, and intelligent composition suggestions, every photo becomes a masterpiece.",
        goalAmount: "500000.00",
        currentAmount: "847392.00",
        creatorId: 1,
        categoryId: 1,
        type: "reward" as const,
        status: "active" as const,
        image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=400&fit=crop",
        gallery: [
          "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=800&h=600&fit=crop",
        ],
        endDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
        backerCount: 2847,
        featured: true,
      },
      {
        title: "Books for Rural Schools Initiative",
        shortDescription: "Help us provide essential educational materials to underserved communities across rural areas",
        description: "Education is a fundamental right, yet many rural schools lack basic educational resources. Our initiative aims to provide comprehensive learning materials, including books, digital resources, and educational tools to schools in underserved areas. Every donation directly impacts a child's future.",
        goalAmount: "50000.00",
        currentAmount: "23847.00",
        creatorId: 2,
        categoryId: 5,
        type: "donation" as const,
        status: "active" as const,
        image: "https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=800&h=400&fit=crop",
        gallery: [
          "https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=600&fit=crop",
        ],
        endDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
        backerCount: 487,
        featured: true,
      },
      {
        title: "GreenPay - Sustainable Digital Payments",
        shortDescription: "Revolutionary payment platform that plants trees with every transaction",
        description: "GreenPay is revolutionizing digital payments by making every transaction contribute to environmental restoration. Our platform combines seamless payment processing with automated tree planting, carbon offset tracking, and sustainability metrics. Join us in building a financial system that heals the planet.",
        goalAmount: "2000000.00",
        currentAmount: "1200000.00",
        creatorId: 3,
        categoryId: 1,
        type: "equity" as const,
        status: "active" as const,
        image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=400&fit=crop",
        gallery: [
          "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=600&fit=crop",
        ],
        endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        backerCount: 247,
        featured: true,
      },
    ];

    campaignData.forEach(campaign => {
      const id = this.campaignIdCounter++;
      this.campaigns.set(id, {
        id,
        ...campaign,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });

    // Seed rewards for first campaign
    const rewardData = [
      {
        campaignId: 1,
        title: "Early Bird Special",
        description: "First 500 backers get 30% off the retail price plus exclusive early access",
        amount: "89.00",
        limitedQuantity: 500,
        claimed: 347,
        estimatedDelivery: "March 2025",
      },
      {
        campaignId: 1,
        title: "Standard Package",
        description: "Complete smartphone with accessories and premium support",
        amount: "129.00",
        limitedQuantity: null,
        claimed: 1250,
        estimatedDelivery: "April 2025",
      },
      {
        campaignId: 1,
        title: "Pro Bundle",
        description: "Smartphone + professional photography course + premium case",
        amount: "199.00",
        limitedQuantity: 200,
        claimed: 89,
        estimatedDelivery: "April 2025",
      },
    ];

    rewardData.forEach(reward => {
      const id = this.rewardIdCounter++;
      this.rewards.set(id, { id, ...reward });
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = {
      id,
      ...insertUser,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;

    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Category methods
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    return Array.from(this.categories.values()).find(cat => cat.slug === slug);
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = this.categoryIdCounter++;
    const category: Category = {
      id,
      projectCount: 0,
      ...insertCategory,
    };
    this.categories.set(id, category);
    return category;
  }

  // Campaign methods
  async getCampaigns(filters: {
    status?: string;
    category?: string;
    featured?: boolean;
    creatorId?: number;
  } = {}): Promise<Campaign[]> {
    let campaigns = Array.from(this.campaigns.values());

    if (filters.status) {
      campaigns = campaigns.filter(c => c.status === filters.status);
    }
    if (filters.featured !== undefined) {
      campaigns = campaigns.filter(c => c.featured === filters.featured);
    }
    if (filters.creatorId) {
      campaigns = campaigns.filter(c => c.creatorId === filters.creatorId);
    }
    if (filters.category) {
      const category = await this.getCategoryBySlug(filters.category);
      if (category) {
        campaigns = campaigns.filter(c => c.categoryId === category.id);
      }
    }

    return campaigns.sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async getCampaign(id: number): Promise<Campaign | undefined> {
    return this.campaigns.get(id);
  }

  async createCampaign(insertCampaign: InsertCampaign): Promise<Campaign> {
    const id = this.campaignIdCounter++;
    const campaign: Campaign = {
      id,
      currentAmount: "0.00",
      backerCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...insertCampaign,
    };
    this.campaigns.set(id, campaign);
    return campaign;
  }

  async updateCampaign(id: number, updates: Partial<InsertCampaign>): Promise<Campaign | undefined> {
    const campaign = this.campaigns.get(id);
    if (!campaign) return undefined;

    const updatedCampaign = {
      ...campaign,
      ...updates,
      updatedAt: new Date(),
    };
    this.campaigns.set(id, updatedCampaign);
    return updatedCampaign;
  }

  async getCampaignsByCreator(creatorId: number): Promise<Campaign[]> {
    return Array.from(this.campaigns.values()).filter(c => c.creatorId === creatorId);
  }

  // Reward methods
  async getRewardsByCampaign(campaignId: number): Promise<Reward[]> {
    return Array.from(this.rewards.values()).filter(r => r.campaignId === campaignId);
  }

  async getReward(id: number): Promise<Reward | undefined> {
    return this.rewards.get(id);
  }

  async createReward(insertReward: InsertReward): Promise<Reward> {
    const id = this.rewardIdCounter++;
    const reward: Reward = {
      id,
      claimed: 0,
      ...insertReward,
    };
    this.rewards.set(id, reward);
    return reward;
  }

  async updateReward(id: number, updates: Partial<InsertReward>): Promise<Reward | undefined> {
    const reward = this.rewards.get(id);
    if (!reward) return undefined;

    const updatedReward = { ...reward, ...updates };
    this.rewards.set(id, updatedReward);
    return updatedReward;
  }

  // Contribution methods
  async getContributionsByCampaign(campaignId: number): Promise<Contribution[]> {
    return Array.from(this.contributions.values()).filter(c => c.campaignId === campaignId);
  }

  async getContributionsByUser(userId: number): Promise<Contribution[]> {
    return Array.from(this.contributions.values()).filter(c => c.userId === userId);
  }

  async createContribution(insertContribution: InsertContribution): Promise<Contribution> {
    const id = this.contributionIdCounter++;
    const contribution: Contribution = {
      id,
      createdAt: new Date(),
      ...insertContribution,
    };
    this.contributions.set(id, contribution);

    // Update campaign funding
    const campaign = await this.getCampaign(insertContribution.campaignId);
    if (campaign) {
      const newAmount = parseFloat(campaign.currentAmount) + parseFloat(insertContribution.amount);
      await this.updateCampaign(campaign.id, {
        currentAmount: newAmount.toString(),
        backerCount: campaign.backerCount + 1,
      });
    }

    // Update reward claimed count
    if (insertContribution.rewardId) {
      const reward = await this.getReward(insertContribution.rewardId);
      if (reward) {
        await this.updateReward(reward.id, {
          claimed: reward.claimed + 1,
        });
      }
    }

    return contribution;
  }

  // Campaign Update methods
  async getUpdatesByCampaign(campaignId: number): Promise<CampaignUpdate[]> {
    return Array.from(this.campaignUpdates.values())
      .filter(u => u.campaignId === campaignId)
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async createCampaignUpdate(insertUpdate: InsertCampaignUpdate): Promise<CampaignUpdate> {
    const id = this.updateIdCounter++;
    const update: CampaignUpdate = {
      id,
      createdAt: new Date(),
      ...insertUpdate,
    };
    this.campaignUpdates.set(id, update);
    return update;
  }

  // Analytics
  async getStats(): Promise<{
    totalFunded: string;
    activeCampaigns: number;
    successfulProjects: number;
    totalBackers: number;
  }> {
    const campaigns = Array.from(this.campaigns.values());
    const totalFunded = campaigns.reduce((sum, c) => sum + parseFloat(c.currentAmount), 0);
    const activeCampaigns = campaigns.filter(c => c.status === "active").length;
    const successfulProjects = campaigns.filter(c => c.status === "funded").length;
    const totalBackers = campaigns.reduce((sum, c) => sum + c.backerCount, 0);

    return {
      totalFunded: `$${Math.floor(totalFunded / 1000000)}M+`,
      activeCampaigns: activeCampaigns + 12844, // Add seed data
      successfulProjects: successfulProjects + 8929, // Add seed data
      totalBackers: totalBackers + 450000, // Add seed data
    };
  }
}

export const storage = new MemStorage();
