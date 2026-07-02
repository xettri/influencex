export type Role = "BRAND" | "INFLUENCER" | "ADMIN";

export type CampaignStatus = "DRAFT" | "ACTIVE" | "PAUSED" | "COMPLETED" | "CANCELLED";

export type BudgetType = "FLAT_FEE" | "CPA" | "MIXED";

export type ApplicationStatus = "PENDING" | "SHORTLISTED" | "APPROVED" | "REJECTED" | "WITHDRAWN";

export type PlatformName = "INSTAGRAM" | "YOUTUBE" | "TIKTOK" | "TWITTER" | "LINKEDIN" | "PINTEREST";

export type VerificationStatus = "UNVERIFIED" | "PENDING" | "VERIFIED" | "FAILED";

export type PaymentStatus = "PENDING" | "LOCKED" | "RELEASED" | "DISPUTED" | "REFUNDED";

export type PaymentType = "UPFRONT" | "FLAT_FEE" | "CPA_PAYOUT" | "REFUND";

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
  verificationCode: string | null;
  verificationStatus: VerificationStatus;
  verificationMethod: string | null;
  verifiedAt: string | null;
  apiFollowerCount: number | null;
  apiEngagementRate: number | null;
  createdAt: string;
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
  authenticityScore: number;
  qualityFlags: string[];
  createdAt: string;
}

export interface AuthenticityReport {
  score: number;
  flags: string[];
  platforms: {
    name: PlatformName;
    handle: string;
    verificationStatus: VerificationStatus;
    verificationMethod: string | null;
    followers: number;
    apiFollowerCount: number | null;
    apiEngagementRate: number | null;
  }[];
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

// ── Analytics ────────────────────────────────────────────────────────────────

export interface BrandAnalytics {
  overview: {
    totalCampaigns: number;
    activeCampaigns: number;
    totalApplications: number;
    approvedCount: number;
    approvalRate: number;
    totalBudgetActive: number;
  };
  applicationsByStatus: Record<string, number>;
  campaignsByStatus: Record<string, number>;
  applicationsOverTime: { date: string; count: number }[];
  topCampaigns: { id: string; title: string; applications: number; approved: number; budget: number }[];
}

export interface CreatorAnalytics {
  overview: {
    totalApplications: number;
    approvedCount: number;
    approvalRate: number;
    pendingCount: number;
    estimatedEarnings: number;
    directHires: number;
  };
  applicationsByStatus: Record<string, number>;
  earningsPipeline: { campaignId: string; title: string; brand: string; budget: number; status: string }[];
  activityByMonth: { month: string; applications: number }[];
}

export type DeliverableStatus = "ACTIVE" | "COMPLETED" | "ARCHIVED";

export interface CampaignDeliverable {
  id: string;
  trackingCode: string;
  targetUrl: string;
  agreedBudget: number | null;
  campaignId: string | null;
  applicationId: string | null;
  directHireId: string | null;
  influencerId: string;
  influencer?: { id: string; displayName: string; avatar: string | null };
  campaign?: { id: string; title: string; brand: { name: string } } | null;
  ytVideoId: string | null;
  ytViews: number;
  ytLikes: number;
  ytComments: number;
  ytLastSynced: string | null;
  reportedReach: number | null;
  reportedImpressions: number | null;
  reportedLikes: number | null;
  reportedComments: number | null;
  reportedShares: number | null;
  reportedSaves: number | null;
  totalClicks: number;
  uniqueClicks: number;
  conversions: number;
  revenue: number;
  status: DeliverableStatus;
  submittedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FunnelLayer {
  totalReach: number;
  totalImpressions: number;
  cpm: number | null;
}

export interface FunnelMiddleLayer {
  totalEngagements: number;
  totalClicks: number;
  cpe: number | null;
  cpc: number | null;
  ctr: number | null;
  breakdown: { likes: number; comments: number; shares: number; saves: number };
}

export interface FunnelBottomLayer {
  totalConversions: number;
  totalRevenue: number;
  cpa: number | null;
  roas: number | null;
}

export interface CampaignMetrics {
  campaign: { id: string; title: string; budget: number; budgetType: BudgetType };
  deliverables: CampaignDeliverable[];
  funnel: {
    budgetBase: number;
    top: FunnelLayer;
    middle: FunnelMiddleLayer;
    bottom: FunnelBottomLayer;
  };
}

export interface Payment {
  id: string;
  campaignId: string | null;
  influencerId: string | null;
  applicationId: string | null;
  directHireId: string | null;
  amount: number;
  status: PaymentStatus;
  type: PaymentType;
  lockedAt: string | null;
  releasedAt: string | null;
  releaseAfter: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  campaign?: { id: string; title: string; brand?: { name: string } } | null;
  influencer?: { id: string; displayName: string } | null;
  directHire?: { id: string; title: string } | null;
}

export type NotificationType =
  | "APPLICATION_RECEIVED"
  | "APPLICATION_SHORTLISTED"
  | "APPLICATION_APPROVED"
  | "APPLICATION_REJECTED"
  | "VERIFICATION_APPROVED"
  | "VERIFICATION_FAILED"
  | "HIRE_REQUEST"
  | "HIRE_ACCEPTED"
  | "HIRE_DECLINED"
  | "PAYMENT_LOCKED"
  | "PAYMENT_RELEASED"
  | "PAYMENT_DISPUTED";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  link: string | null;
  createdAt: string;
}
