import type { FastifyPluginAsync } from "fastify";
import type { Prisma } from "@prisma/client";
import {
  UpdateInfluencerProfileSchema,
  AddPlatformSchema,
} from "@influencex/shared";
import { sendSuccess, sendPaginated, sendError } from "../utils/response.js";

const influencerRoutes: FastifyPluginAsync = async (fastify) => {

  // GET /influencers — public directory with filters
  fastify.get("/", async (request, reply) => {
    const q = request.query as {
      page?: string;
      limit?: string;
      search?: string;
      platform?: string;
      niche?: string;
      minFollowers?: string;
      maxFollowers?: string;
      minRate?: string;
      maxRate?: string;
    };

    const page = Math.max(1, Number(q.page ?? 1));
    const limit = Math.min(50, Math.max(1, Number(q.limit ?? 20)));

    const where: Prisma.InfluencerProfileWhereInput = {
      profileCompleted: true,
    };

    if (q.search?.trim()) {
      where.displayName = { contains: q.search.trim(), mode: "insensitive" };
    }

    if (q.niche?.trim()) {
      where.niche = { has: q.niche.trim() };
    }

    if (q.minFollowers || q.maxFollowers) {
      where.followersCount = {
        ...(q.minFollowers ? { gte: Number(q.minFollowers) } : {}),
        ...(q.maxFollowers ? { lte: Number(q.maxFollowers) } : {}),
      };
    }

    if (q.minRate || q.maxRate) {
      where.minRate = {
        ...(q.minRate ? { gte: Number(q.minRate) } : {}),
        ...(q.maxRate ? { lte: Number(q.maxRate) } : {}),
      };
    }

    if (q.platform) {
      where.platforms = {
        some: { name: q.platform as Prisma.EnumPlatformNameFilter["equals"] },
      };
    }

    const [influencers, total] = await Promise.all([
      fastify.prisma.influencerProfile.findMany({
        where,
        select: {
          id: true,
          displayName: true,
          avatar: true,
          bio: true,
          niche: true,
          location: true,
          followersCount: true,
          engagementRate: true,
          minRate: true,
          rateCard: true,
          verified: true,
          platforms: {
            select: { id: true, name: true, handle: true, followers: true, verified: true },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ verified: "desc" }, { followersCount: "desc" }],
      }),
      fastify.prisma.influencerProfile.count({ where }),
    ]);

    return sendPaginated(reply, influencers, total, page, limit);
  });

  // GET /influencers/me — current influencer's own profile
  fastify.get("/me", { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { sub } = request.user;
    const profile = await fastify.prisma.influencerProfile.findUnique({
      where: { userId: sub },
      include: { platforms: true },
    });
    if (!profile) return sendError(reply, 404, "Influencer profile not found", "NOT_FOUND");
    return sendSuccess(reply, profile);
  });

  // GET /influencers/:id — public profile
  fastify.get("/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const profile = await fastify.prisma.influencerProfile.findUnique({
      where: { id },
      include: {
        platforms: true,
        _count: { select: { applications: true, directHires: true } },
      },
    });
    if (!profile) return sendError(reply, 404, "Influencer not found", "NOT_FOUND");
    return sendSuccess(reply, profile);
  });

  // PATCH /influencers/me — update own profile
  fastify.patch("/me", { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { sub } = request.user;
    const profile = await fastify.prisma.influencerProfile.findUnique({ where: { userId: sub } });
    if (!profile) return sendError(reply, 404, "Influencer profile not found", "NOT_FOUND");

    const result = UpdateInfluencerProfileSchema.safeParse(request.body);
    if (!result.success) {
      return sendError(reply, 400, result.error.errors[0]?.message ?? "Validation error", "VALIDATION_ERROR");
    }

    const { rateCard, ...rest } = result.data;
    const rateCardValues = rateCard ? Object.values(rateCard).filter(Boolean) as number[] : [];
    const minRate = rateCardValues.length > 0 ? Math.min(...rateCardValues) : undefined;

    // Determine if profile is now complete
    const platforms = await fastify.prisma.platform.count({ where: { influencerId: profile.id } });
    const profileCompleted = !!(
      (result.data.displayName ?? profile.displayName) &&
      platforms > 0
    );

    const updated = await fastify.prisma.influencerProfile.update({
      where: { id: profile.id },
      data: {
        ...rest,
        ...(rateCard !== undefined ? { rateCard, minRate } : {}),
        profileCompleted,
      },
      include: { platforms: true },
    });
    return sendSuccess(reply, updated, 200, "Profile updated");
  });

  // POST /influencers/me/platforms — add a social platform
  fastify.post("/me/platforms", { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { sub } = request.user;
    const profile = await fastify.prisma.influencerProfile.findUnique({ where: { userId: sub } });
    if (!profile) return sendError(reply, 404, "Influencer profile not found", "NOT_FOUND");

    const result = AddPlatformSchema.safeParse(request.body);
    if (!result.success) {
      return sendError(reply, 400, result.error.errors[0]?.message ?? "Validation error", "VALIDATION_ERROR");
    }

    try {
      const platform = await fastify.prisma.platform.create({
        data: { ...result.data, influencerId: profile.id },
      });

      // Recompute total follower count and mark profile as complete
      const allPlatforms = await fastify.prisma.platform.findMany({ where: { influencerId: profile.id } });
      const totalFollowers = allPlatforms.reduce((s, p) => s + p.followers, 0);
      await fastify.prisma.influencerProfile.update({
        where: { id: profile.id },
        data: { followersCount: totalFollowers, profileCompleted: true },
      });

      return sendSuccess(reply, platform, 201, "Platform added");
    } catch (err: unknown) {
      if ((err as { code?: string }).code === "P2002") {
        return sendError(reply, 409, "Platform already added", "CONFLICT");
      }
      throw err;
    }
  });

  // DELETE /influencers/me/platforms/:platformId — remove a platform
  fastify.delete("/me/platforms/:platformId", { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { sub } = request.user;
    const { platformId } = request.params as { platformId: string };

    const profile = await fastify.prisma.influencerProfile.findUnique({ where: { userId: sub } });
    if (!profile) return sendError(reply, 404, "Influencer profile not found", "NOT_FOUND");

    const platform = await fastify.prisma.platform.findFirst({
      where: { id: platformId, influencerId: profile.id },
    });
    if (!platform) return sendError(reply, 404, "Platform not found", "NOT_FOUND");

    await fastify.prisma.platform.delete({ where: { id: platformId } });

    // Recompute followers
    const remaining = await fastify.prisma.platform.findMany({ where: { influencerId: profile.id } });
    const totalFollowers = remaining.reduce((s, p) => s + p.followers, 0);
    await fastify.prisma.influencerProfile.update({
      where: { id: profile.id },
      data: { followersCount: totalFollowers },
    });

    return sendSuccess(reply, null, 200, "Platform removed");
  });

  // PATCH /influencers/:id/verify — admin only
  fastify.patch("/:id/verify", { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { sub } = request.user;
    const { id } = request.params as { id: string };

    const adminUser = await fastify.prisma.user.findUnique({ where: { id: sub }, select: { role: true } });
    if (adminUser?.role !== "ADMIN") return sendError(reply, 403, "Admin access required", "FORBIDDEN");

    const { verified } = request.body as { verified: boolean };
    const profile = await fastify.prisma.influencerProfile.update({
      where: { id },
      data: { verified: Boolean(verified) },
    });
    return sendSuccess(reply, profile, 200, `Influencer ${verified ? "verified" : "unverified"}`);
  });
};

export default influencerRoutes;
