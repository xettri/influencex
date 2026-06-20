import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { sendSuccess, sendError } from "../utils/response.js";

const WaitlistSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  role: z.enum(["BRAND", "INFLUENCER"]),
});

const waitlistRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post("/", async (request, reply) => {
    const result = WaitlistSchema.safeParse(request.body);
    if (!result.success) {
      return sendError(reply, 400, result.error.errors[0]?.message ?? "Validation error", "VALIDATION_ERROR");
    }

    const { email, name, role } = result.data;

    try {
      const existing = await fastify.prisma.waitlistEntry.findUnique({ where: { email } });
      if (existing) {
        return sendError(reply, 409, "You're already on the waitlist!", "ALREADY_JOINED");
      }

      await fastify.prisma.waitlistEntry.create({ data: { email, name, role } });

      return sendSuccess(reply, { email }, 201, "You're on the waitlist! We'll be in touch soon.");
    } catch {
      return sendError(reply, 500, "Something went wrong", "INTERNAL_ERROR");
    }
  });

  fastify.get("/count", async (_request, reply) => {
    const count = await fastify.prisma.waitlistEntry.count();
    return sendSuccess(reply, { count });
  });
};

export default waitlistRoutes;
