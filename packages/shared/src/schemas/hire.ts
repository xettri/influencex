import { z } from "zod";

export const CreateDirectHireSchema = z.object({
  influencerId: z.string().min(1),
  title: z.string().min(5, "Title must be at least 5 characters").max(100),
  description: z.string().min(20, "Description must be at least 20 characters").max(1000),
  budget: z.number().positive("Budget must be positive"),
  deliverables: z.string().min(10, "Describe what you need").max(500),
  deadline: z.string().datetime().optional(),
  brandMessage: z.string().max(500).optional(),
});

export const UpdateHireStatusSchema = z.object({
  status: z.enum(["ACCEPTED", "IN_PROGRESS", "COMPLETED", "DECLINED", "CANCELLED"]),
});

export type CreateDirectHireInput = z.infer<typeof CreateDirectHireSchema>;
export type UpdateHireStatusInput = z.infer<typeof UpdateHireStatusSchema>;
