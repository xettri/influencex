export type Role = "BRAND" | "INFLUENCER" | "ADMIN";

export type CampaignStatus = "DRAFT" | "ACTIVE" | "PAUSED" | "COMPLETED" | "CANCELLED";

export type BudgetType = "FLAT_FEE" | "CPA" | "MIXED";

export type ApplicationStatus = "PENDING" | "SHORTLISTED" | "APPROVED" | "REJECTED" | "WITHDRAWN";

export type PlatformName = "INSTAGRAM" | "YOUTUBE" | "TIKTOK" | "TWITTER" | "LINKEDIN" | "PINTEREST";

export type PaymentStatus = "PENDING" | "LOCKED" | "RELEASED" | "DISPUTED" | "REFUNDED";

export type DirectHireStatus = "PENDING" | "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "DECLINED" | "CANCELLED";

export interface RateCard {
  perPost?: number;
  perReel?: number;
  perVideo?: number;
  perStory?: number;
}

export interface User {
  id: string;
  email: string;
  role: Role;
  createdAt: string;
}

export interface BrandProfile {
  id: string;
  userId: string;
  name: string;
  logo?: string;
  description?: string;
  website?: string;
  industry?: string;
  verified: boolean;
  createdAt: string;
}

export interface Platform {
  id: string;
  name: PlatformName;
  handle: string;
  followers: number;
  verified: boolean;
}

export interface InfluencerProfile {
  id: string;
  userId: string;
  displayName: string;
  avatar?: string;
  bio?: string;
  niche: string[];
  location?: string;
  platforms: Platform[];
  followersCount: number;
  engagementRate: number;
  rateCard?: RateCard;
  minRate?: number;
  profileCompleted: boolean;
  verified: boolean;
  createdAt: string;
}

export interface Campaign {
  id: string;
  brandId: string;
  title: string;
  description: string;
  budget: number;
  budgetType: BudgetType;
  criteria: CampaignCriteria;
  status: CampaignStatus;
  campaignCode: string;
  startDate?: string;
  endDate?: string;
  createdAt: string;
}

export interface CampaignCriteria {
  minFollowers?: number;
  maxFollowers?: number;
  minEngagementRate?: number;
  platforms?: PlatformName[];
  niches?: string[];
  regions?: string[];
}

export interface CampaignApplication {
  id: string;
  campaignId: string;
  influencerId: string;
  status: ApplicationStatus;
  pitch?: string;
  createdAt: string;
}

export interface DirectHire {
  id: string;
  brandId: string;
  influencerId: string;
  title: string;
  description: string;
  budget: number;
  deliverables: string;
  deadline?: string;
  status: DirectHireStatus;
  brandMessage?: string;
  createdAt: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}
