import type { FastifyPluginAsync } from "fastify";
import { sendSuccess, sendError } from "../utils/response.js";
import { computeAndSaveAuthenticityScore } from "../services/authenticity.js";
import { notify } from "../lib/notify.js";

const adminRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook("preHandler", async (request, reply) => {
    await fastify.authenticate(request, reply);
    const { sub } = request.user;
    const user = await fastify.prisma.user.findUnique({ where: { id: sub }, select: { role: true } });
    if (user?.role !== "ADMIN") {
      return sendError(reply, 403, "Admin access required", "FORBIDDEN");
    }
  });

  // GET /admin/verifications — all PENDING platform verifications
  fastify.get("/verifications", async (_request, reply) => {
    const platforms = await fastify.prisma.platform.findMany({
      where: { verificationStatus: "PENDING" },
      include: {
        influencer: {
          select: {
            id: true,
            displayName: true,
            avatar: true,
            user: { select: { email: true } },
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });
    return sendSuccess(reply, platforms);
  });

  // PATCH /admin/platforms/:id/verify — approve
  fastify.patch("/platforms/:id/verify", async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      const platform = await fastify.prisma.platform.update({
        where: { id },
        data: { verified: true, verificationStatus: "VERIFIED", verificationMethod: "MANUAL_ADMIN", verifiedAt: new Date() },
        include: { influencer: { select: { id: true, userId: true } } },
      });
      if (platform.influencer) {
        await computeAndSaveAuthenticityScore(fastify.prisma, platform.influencer.id);
        void notify(fastify.prisma, {
          userId: platform.influencer.userId,
          type: "VERIFICATION_APPROVED",
          title: `${platform.name} account verified!`,
          body: `Your @${platform.handle} ${platform.name} account is now verified and visible to brands.`,
          link: "/dashboard/profile",
        });
      }
      return sendSuccess(reply, platform, 200, "Platform verified");
    } catch {
      return sendError(reply, 404, "Platform not found", "NOT_FOUND");
    }
  });

  // PATCH /admin/platforms/:id/fail — reject
  fastify.patch("/platforms/:id/fail", async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      const platform = await fastify.prisma.platform.update({
        where: { id },
        data: { verificationStatus: "FAILED" },
        include: { influencer: { select: { id: true, userId: true } } },
      });
      if (platform.influencer) {
        await computeAndSaveAuthenticityScore(fastify.prisma, platform.influencer.id);
        void notify(fastify.prisma, {
          userId: platform.influencer.userId,
          type: "VERIFICATION_FAILED",
          title: `${platform.name} verification failed`,
          body: `We couldn't verify @${platform.handle}. Please ensure the code is in your bio and try again.`,
          link: "/dashboard/profile",
        });
      }
      return sendSuccess(reply, platform, 200, "Verification failed");
    } catch {
      return sendError(reply, 404, "Platform not found", "NOT_FOUND");
    }
  });
};

export default adminRoutes;
