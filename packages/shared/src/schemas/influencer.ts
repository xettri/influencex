import { z } from "zod";

export const RateCardSchema = z.object({
  perPost: z.number().positive().optional(),
  perReel: z.number().positive().optional(),
  perVideo: z.number().positive().optional(),
  perStory: z.number().positive().optional(),
});

export const UpdateInfluencerProfileSchema = z.object({
  displayName: z.string().min(2, "Display name must be at least 2 characters").max(100).optional(),
  bio: z.string().max(500, "Bio must be under 500 characters").optional(),
  niche: z.array(z.string().min(1)).optional(),
  location: z.string().max(100).optional(),
  rateCard: RateCardSchema.optional(),
});

export const AddPlatformSchema = z.object({
  name: z.enum(["INSTAGRAM", "YOUTUBE", "TIKTOK", "TWITTER", "LINKEDIN", "PINTEREST"]),
  handle: z.string().min(1, "Handle is required").max(100),
  followers: z.number().int().nonnegative("Followers must be 0 or more"),
});

export type UpdateInfluencerProfileInput = z.infer<typeof UpdateInfluencerProfileSchema>;
export type AddPlatformInput = z.infer<typeof AddPlatformSchema>;
