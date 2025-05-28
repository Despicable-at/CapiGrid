import type { User, Campaign, Category, Reward, Contribution } from "@shared/schema";

export interface CampaignWithDetails extends Campaign {
  creator?: User;
  category?: Category;
  rewards?: Reward[];
  contributions?: Contribution[];
  progress?: number;
  daysLeft?: number;
}

export interface UserProfile extends Omit<User, 'password'> {
  campaignsCreated?: number;
  totalFunded?: string;
  totalBacked?: string;
  campaignsBacked?: number;
}

export interface PaymentData {
  amount: string;
  rewardId?: number;
  message?: string;
  anonymous?: boolean;
}

export interface CreateCampaignData {
  title: string;
  shortDescription: string;
  description: string;
  goalAmount: string;
  categoryId: number;
  type: "reward" | "donation" | "equity";
  image: string;
  endDate: Date;
  rewards?: Array<{
    title: string;
    description: string;
    amount: string;
    limitedQuantity?: number;
    estimatedDelivery?: string;
  }>;
}

export interface DashboardStats {
  totalFunded: string;
  activeCampaigns: number;
  successfulProjects: number;
  totalBackers: number;
}
