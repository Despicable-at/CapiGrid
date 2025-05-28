import { User, Category, Campaign, Reward, Contribution, CampaignUpdate } from './database';
import type { IStorage } from './storage';
import type {
  User as UserType,
  InsertUser,
  Category as CategoryType,
  InsertCategory,
  Campaign as CampaignType,
  InsertCampaign,
  Reward as RewardType,
  InsertReward,
  Contribution as ContributionType,
  InsertContribution,
  CampaignUpdate as CampaignUpdateType,
  InsertCampaignUpdate,
} from "@shared/schema";

export class MongoStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<UserType | undefined> {
    const user = await User.findOne({ id });
    return user ? this.convertMongoUser(user) : undefined;
  }

  async getUserByEmail(email: string): Promise<UserType | undefined> {
    const user = await User.findOne({ email });
    return user ? this.convertMongoUser(user) : undefined;
  }

  async getUserByUsername(username: string): Promise<UserType | undefined> {
    const user = await User.findOne({ username });
    return user ? this.convertMongoUser(user) : undefined;
  }

  async createUser(insertUser: InsertUser): Promise<UserType> {
    const user = await User.create(insertUser);
    return this.convertMongoUser(user);
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<UserType | undefined> {
    const user = await User.findOneAndUpdate({ id }, updates, { new: true });
    return user ? this.convertMongoUser(user) : undefined;
  }

  // Category methods
  async getCategories(): Promise<CategoryType[]> {
    const categories = await Category.find();
    return categories.map(this.convertMongoCategory);
  }

  async getCategory(id: number): Promise<CategoryType | undefined> {
    const category = await Category.findOne({ id });
    return category ? this.convertMongoCategory(category) : undefined;
  }

  async getCategoryBySlug(slug: string): Promise<CategoryType | undefined> {
    const category = await Category.findOne({ slug });
    return category ? this.convertMongoCategory(category) : undefined;
  }

  async createCategory(insertCategory: InsertCategory): Promise<CategoryType> {
    const category = await Category.create(insertCategory);
    return this.convertMongoCategory(category);
  }

  // Campaign methods
  async getCampaigns(filters: {
    status?: string;
    category?: string;
    featured?: boolean;
    creatorId?: number;
  } = {}): Promise<CampaignType[]> {
    const query: any = {};
    
    if (filters.status) {
      query.status = filters.status;
    }
    if (filters.featured !== undefined) {
      query.featured = filters.featured;
    }
    if (filters.creatorId) {
      query.creatorId = filters.creatorId;
    }
    if (filters.category) {
      const category = await Category.findOne({ slug: filters.category });
      if (category) {
        query.categoryId = category._id;
      }
    }

    const campaigns = await Campaign.find(query).sort({ createdAt: -1 });
    return campaigns.map(this.convertMongoCampaign);
  }

  async getCampaign(id: number): Promise<CampaignType | undefined> {
    const campaign = await Campaign.findOne({ id });
    return campaign ? this.convertMongoCampaign(campaign) : undefined;
  }

  async createCampaign(insertCampaign: InsertCampaign): Promise<CampaignType> {
    const campaign = await Campaign.create(insertCampaign);
    return this.convertMongoCampaign(campaign);
  }

  async updateCampaign(id: number, updates: Partial<InsertCampaign>): Promise<CampaignType | undefined> {
    const campaign = await Campaign.findOneAndUpdate(
      { id }, 
      { ...updates, updatedAt: new Date() }, 
      { new: true }
    );
    return campaign ? this.convertMongoCampaign(campaign) : undefined;
  }

  async getCampaignsByCreator(creatorId: number): Promise<CampaignType[]> {
    const campaigns = await Campaign.find({ creatorId }).sort({ createdAt: -1 });
    return campaigns.map(this.convertMongoCampaign);
  }

  // Reward methods
  async getRewardsByCampaign(campaignId: number): Promise<RewardType[]> {
    const rewards = await Reward.find({ campaignId });
    return rewards.map(this.convertMongoReward);
  }

  async getReward(id: number): Promise<RewardType | undefined> {
    const reward = await Reward.findOne({ id });
    return reward ? this.convertMongoReward(reward) : undefined;
  }

  async createReward(insertReward: InsertReward): Promise<RewardType> {
    const reward = await Reward.create(insertReward);
    return this.convertMongoReward(reward);
  }

  async updateReward(id: number, updates: Partial<InsertReward>): Promise<RewardType | undefined> {
    const reward = await Reward.findOneAndUpdate({ id }, updates, { new: true });
    return reward ? this.convertMongoReward(reward) : undefined;
  }

  // Contribution methods
  async getContributionsByCampaign(campaignId: number): Promise<ContributionType[]> {
    const contributions = await Contribution.find({ campaignId }).sort({ createdAt: -1 });
    return contributions.map(this.convertMongoContribution);
  }

  async getContributionsByUser(userId: number): Promise<ContributionType[]> {
    const contributions = await Contribution.find({ userId }).sort({ createdAt: -1 });
    return contributions.map(this.convertMongoContribution);
  }

  async createContribution(insertContribution: InsertContribution): Promise<ContributionType> {
    const contribution = await Contribution.create(insertContribution);

    // Update campaign funding
    const campaign = await Campaign.findOne({ id: insertContribution.campaignId });
    if (campaign) {
      const newAmount = parseFloat(campaign.currentAmount) + parseFloat(insertContribution.amount);
      await Campaign.findOneAndUpdate({ id: insertContribution.campaignId }, {
        currentAmount: newAmount.toString(),
        backerCount: campaign.backerCount + 1,
      });
    }

    // Update reward claimed count
    if (insertContribution.rewardId) {
      await Reward.findOneAndUpdate({ id: insertContribution.rewardId }, {
        $inc: { claimed: 1 }
      });
    }

    return this.convertMongoContribution(contribution);
  }

  // Campaign Update methods
  async getUpdatesByCampaign(campaignId: number): Promise<CampaignUpdateType[]> {
    const updates = await CampaignUpdate.find({ campaignId }).sort({ createdAt: -1 });
    return updates.map(this.convertMongoCampaignUpdate);
  }

  async createCampaignUpdate(insertUpdate: InsertCampaignUpdate): Promise<CampaignUpdateType> {
    const update = await CampaignUpdate.create(insertUpdate);
    return this.convertMongoCampaignUpdate(update);
  }

  // Analytics
  async getStats(): Promise<{
    totalFunded: string;
    activeCampaigns: number;
    successfulProjects: number;
    totalBackers: number;
  }> {
    const campaigns = await Campaign.find();
    const totalFunded = campaigns.reduce((sum, campaign) => sum + parseFloat(campaign.currentAmount), 0);
    const activeCampaigns = campaigns.filter(c => c.status === "active").length;
    const successfulProjects = campaigns.filter(c => c.status === "funded").length;
    const totalBackers = campaigns.reduce((sum, campaign) => sum + campaign.backerCount, 0);

    return {
      totalFunded: totalFunded > 1000000 ? `$${Math.round(totalFunded / 1000000)}M+` : `$${totalFunded.toLocaleString()}`,
      activeCampaigns,
      successfulProjects,
      totalBackers,
    };
  }

  // Admin methods
  async getAllUsers(page: number = 1, limit: number = 20): Promise<{ users: UserType[], total: number }> {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      User.find().skip(skip).limit(limit).sort({ createdAt: -1 }),
      User.countDocuments()
    ]);
    return {
      users: users.map(this.convertMongoUser),
      total
    };
  }

  async getAllCampaigns(page: number = 1, limit: number = 20): Promise<{ campaigns: CampaignType[], total: number }> {
    const skip = (page - 1) * limit;
    const [campaigns, total] = await Promise.all([
      Campaign.find().skip(skip).limit(limit).sort({ createdAt: -1 }),
      Campaign.countDocuments()
    ]);
    return {
      campaigns: campaigns.map(this.convertMongoCampaign),
      total
    };
  }

  async toggleUserStatus(id: number, isActive: boolean): Promise<UserType | undefined> {
    const user = await User.findOneAndUpdate({ id }, { isActive }, { new: true });
    return user ? this.convertMongoUser(user) : undefined;
  }

  async approveCampaign(id: number, approved: boolean, notes?: string): Promise<CampaignType | undefined> {
    const campaign = await Campaign.findOneAndUpdate(
      { id }, 
      { 
        adminApproved: approved,
        adminNotes: notes,
        status: approved ? 'active' : 'draft'
      }, 
      { new: true }
    );
    return campaign ? this.convertMongoCampaign(campaign) : undefined;
  }

  async featureCampaign(id: number, featured: boolean): Promise<CampaignType | undefined> {
    const campaign = await Campaign.findOneAndUpdate({ id }, { featured }, { new: true });
    return campaign ? this.convertMongoCampaign(campaign) : undefined;
  }

  // Helper methods to convert MongoDB documents to our schema types
  private convertMongoUser(mongoUser: any): UserType {
    return {
      id: mongoUser._id.toString(),
      username: mongoUser.username,
      email: mongoUser.email,
      password: mongoUser.password,
      fullName: mongoUser.fullName,
      avatar: mongoUser.avatar,
      bio: mongoUser.bio,
      isCreator: mongoUser.isCreator,
      createdAt: mongoUser.createdAt,
    };
  }

  private convertMongoCategory(mongoCategory: any): CategoryType {
    return {
      id: mongoCategory._id.toString(),
      name: mongoCategory.name,
      icon: mongoCategory.icon,
      slug: mongoCategory.slug,
      projectCount: mongoCategory.projectCount,
    };
  }

  private convertMongoCampaign(mongoCampaign: any): CampaignType {
    return {
      id: mongoCampaign._id.toString(),
      title: mongoCampaign.title,
      description: mongoCampaign.description,
      shortDescription: mongoCampaign.shortDescription,
      goalAmount: mongoCampaign.goalAmount,
      currentAmount: mongoCampaign.currentAmount,
      creatorId: mongoCampaign.creatorId.toString(),
      categoryId: mongoCampaign.categoryId.toString(),
      type: mongoCampaign.type,
      status: mongoCampaign.status,
      image: mongoCampaign.image,
      gallery: mongoCampaign.gallery,
      endDate: mongoCampaign.endDate,
      createdAt: mongoCampaign.createdAt,
      updatedAt: mongoCampaign.updatedAt,
      backerCount: mongoCampaign.backerCount,
      featured: mongoCampaign.featured,
    };
  }

  private convertMongoReward(mongoReward: any): RewardType {
    return {
      id: mongoReward._id.toString(),
      campaignId: mongoReward.campaignId.toString(),
      title: mongoReward.title,
      description: mongoReward.description,
      amount: mongoReward.amount,
      limitedQuantity: mongoReward.limitedQuantity,
      claimed: mongoReward.claimed,
      estimatedDelivery: mongoReward.estimatedDelivery,
    };
  }

  private convertMongoContribution(mongoContribution: any): ContributionType {
    return {
      id: mongoContribution._id.toString(),
      campaignId: mongoContribution.campaignId.toString(),
      userId: mongoContribution.userId.toString(),
      amount: mongoContribution.amount,
      rewardId: mongoContribution.rewardId?.toString(),
      message: mongoContribution.message,
      anonymous: mongoContribution.anonymous,
      createdAt: mongoContribution.createdAt,
    };
  }

  private convertMongoCampaignUpdate(mongoUpdate: any): CampaignUpdateType {
    return {
      id: mongoUpdate._id.toString(),
      campaignId: mongoUpdate.campaignId.toString(),
      title: mongoUpdate.title,
      content: mongoUpdate.content,
      createdAt: mongoUpdate.createdAt,
    };
  }
}
