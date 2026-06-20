import { z } from "zod";

export const CampaignCriteriaSchema = z.object({
  minFollowers: z.number().int().positive().optional(),
  maxFollowers: z.number().int().positive().optional(),
  minEngagementRate: z.number().min(0).max(100).optional(),
  platforms: z
    .array(z.enum(["INSTAGRAM", "YOUTUBE", "TIKTOK", "TWITTER", "LINKEDIN", "PINTEREST"]))
    .optional(),
  niches: z.array(z.string()).optional(),
  regions: z.array(z.string()).optional(),
});

export const CreateCampaignSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100),
  description: z.string().min(20, "Description must be at least 20 characters").max(2000),
  budget: z.number().positive("Budget must be positive"),
  budgetType: z.enum(["FLAT_FEE", "CPA", "MIXED"]),
  criteria: CampaignCriteriaSchema,
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export const UpdateCampaignSchema = CreateCampaignSchema.partial().extend({
  status: z.enum(["DRAFT", "ACTIVE", "PAUSED", "COMPLETED", "CANCELLED"]).optional(),
});

export const ApplyCampaignSchema = z.object({
  pitch: z.string().min(50, "Pitch must be at least 50 characters").max(1000).optional(),
});

export type CreateCampaignInput = z.infer<typeof CreateCampaignSchema>;
export type UpdateCampaignInput = z.infer<typeof UpdateCampaignSchema>;
export type ApplyCampaignInput = z.infer<typeof ApplyCampaignSchema>;
