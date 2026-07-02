import type { FastifyPluginAsync } from "fastify";
import { sendSuccess, sendError } from "../utils/response.js";
import { fetchYouTubeVideoStats, extractYouTubeVideoId } from "../services/yt-video-metrics.js";
import { createHash } from "crypto";

function ipHash(ip: string): string {
  return createHash("sha256").update(ip).digest("hex").slice(0, 16);
}

interface FlatDeliverable {
  agreedBudget: number | null;
  reportedReach: number | null;
  reportedImpressions: number | null;
  ytViews: number;
  ytLikes: number;
  ytComments: number;
  reportedLikes: number | null;
  reportedComments: number | null;
  reportedShares: number | null;
  reportedSaves: number | null;
  totalClicks: number;
  conversions: number;
  revenue: number;
}

function computeFunnel(deliverables: FlatDeliverable[], totalBudget: number) {
  const spent = deliverables.reduce((s, d) => s + (d.agreedBudget ?? 0), 0);
  const budgetBase = spent || totalBudget;

  const totalReach = deliverables.reduce((s, d) => s + (d.reportedReach ?? 0), 0);
  const totalImpressions = deliverables.reduce((s, d) => s + (d.reportedImpressions ?? 0) + d.ytViews, 0);
  const totalClicks = deliverables.reduce((s, d) => s + d.totalClicks, 0);
  const totalConversions = deliverables.reduce((s, d) => s + d.conversions, 0);
  const totalRevenue = deliverables.reduce((s, d) => s + d.revenue, 0);

  const likes = deliverables.reduce((s, d) => s + (d.ytViews > 0 ? d.ytLikes : (d.reportedLikes ?? 0)), 0);
  const comments = deliverables.reduce((s, d) => s + (d.ytViews > 0 ? d.ytComments : (d.reportedComments ?? 0)), 0);
  const shares = deliverables.reduce((s, d) => s + (d.reportedShares ?? 0), 0);
  const saves = deliverables.reduce((s, d) => s + (d.reportedSaves ?? 0), 0);
  const totalEngagements = likes + comments + shares + saves;

  return {
    budgetBase,
    top: {
      totalReach,
      totalImpressions,
      cpm: totalImpressions > 0 ? (budgetBase / totalImpressions) * 1000 : null,
    },
    middle: {
      totalEngagements,
      totalClicks,
      cpe: totalEngagements > 0 ? budgetBase / totalEngagements : null,
      cpc: totalClicks > 0 ? budgetBase / totalClicks : null,
      ctr: totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : null,
      breakdown: { likes, comments, shares, saves },
    },
    bottom: {
      totalConversions,
      totalRevenue,
      cpa: totalConversions > 0 ? budgetBase / totalConversions : null,
      roas: budgetBase > 0 ? totalRevenue / budgetBase : null,
    },
  };
}

const deliverableRoutes: FastifyPluginAsync = async (fastify) => {
  // Creator: get own deliverables
  fastify.get("/my", { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { sub } = request.user;
    const profile = await fastify.prisma.influencerProfile.findUnique({ where: { userId: sub } });
    if (!profile) return sendError(reply, 403, "Creator account required");

    const deliverables = await fastify.prisma.campaignDeliverable.findMany({
      where: { influencerId: profile.id },
      include: {
        campaign: { select: { id: true, title: true, brand: { select: { name: true } } } },
        application: { select: { id: true, status: true } },
        directHire: { select: { id: true, title: true, status: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return sendSuccess(reply, deliverables);
  });

  // Creator: create a deliverable
  fastify.post<{
    Body: { targetUrl: string; agreedBudget?: number; applicationId?: string; directHireId?: string };
  }>("/", { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { sub } = request.user;
    const profile = await fastify.prisma.influencerProfile.findUnique({ where: { userId: sub } });
    if (!profile) return sendError(reply, 403, "Creator account required");

    const { targetUrl, agreedBudget, applicationId, directHireId } = request.body;
    if (!targetUrl) return sendError(reply, 400, "targetUrl is required");
    if (!applicationId && !directHireId) return sendError(reply, 400, "applicationId or directHireId required");

    let campaignId: string | undefined;

    if (applicationId) {
      const app = await fastify.prisma.campaignApplication.findUnique({
        where: { id: applicationId },
        include: { deliverable: true },
      });
      if (!app || app.influencerId !== profile.id) return sendError(reply, 404, "Application not found");
      if (app.status !== "APPROVED") return sendError(reply, 400, "Application must be APPROVED");
      if (app.deliverable) return sendError(reply, 409, "Deliverable already exists");
      campaignId = app.campaignId;
    }

    if (directHireId) {
      const hire = await fastify.prisma.directHire.findUnique({
        where: { id: directHireId },
        include: { deliverable: true },
      });
      if (!hire || hire.influencerId !== profile.id) return sendError(reply, 404, "Hire not found");
      if (hire.status !== "ACCEPTED" && hire.status !== "IN_PROGRESS") return sendError(reply, 400, "Hire must be active");
      if (hire.deliverable) return sendError(reply, 409, "Deliverable already exists");
    }

    const deliverable = await fastify.prisma.campaignDeliverable.create({
      data: { targetUrl, agreedBudget, campaignId, applicationId, directHireId, influencerId: profile.id },
    });

    return sendSuccess(reply, deliverable, 201);
  });

  // Creator: submit YouTube video + self-reported metrics
  fastify.patch<{
    Params: { id: string };
    Body: {
      ytVideoUrl?: string;
      reportedReach?: number;
      reportedImpressions?: number;
      reportedLikes?: number;
      reportedComments?: number;
      reportedShares?: number;
      reportedSaves?: number;
    };
  }>("/:id/report", { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { sub } = request.user;
    const profile = await fastify.prisma.influencerProfile.findUnique({ where: { userId: sub } });
    if (!profile) return sendError(reply, 403, "Creator account required");

    const deliverable = await fastify.prisma.campaignDeliverable.findUnique({ where: { id: request.params.id } });
    if (!deliverable || deliverable.influencerId !== profile.id) return sendError(reply, 404, "Deliverable not found");

    const { ytVideoUrl, ...selfReport } = request.body;

    let ytData: { ytVideoId?: string; ytViews?: number; ytLikes?: number; ytComments?: number; ytLastSynced?: Date } = {};
    if (ytVideoUrl) {
      const videoId = extractYouTubeVideoId(ytVideoUrl);
      if (!videoId) return sendError(reply, 400, "Invalid YouTube video URL or ID");
      const stats = await fetchYouTubeVideoStats(videoId);
      ytData = {
        ytVideoId: videoId,
        ytViews: stats?.viewCount ?? 0,
        ytLikes: stats?.likeCount ?? 0,
        ytComments: stats?.commentCount ?? 0,
        ytLastSynced: new Date(),
      };
    }

    const updated = await fastify.prisma.campaignDeliverable.update({
      where: { id: request.params.id },
      data: {
        ...selfReport,
        ...ytData,
        submittedAt: deliverable.submittedAt ?? new Date(),
      },
    });

    return sendSuccess(reply, updated);
  });

  // Brand: report conversions + revenue
  fastify.patch<{
    Params: { id: string };
    Body: { conversions?: number; revenue?: number };
  }>("/:id/conversions", { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { sub } = request.user;
    const brand = await fastify.prisma.brandProfile.findUnique({ where: { userId: sub } });
    if (!brand) return sendError(reply, 403, "Brand account required");

    const deliverable = await fastify.prisma.campaignDeliverable.findUnique({
      where: { id: request.params.id },
      include: { campaign: true },
    });
    if (!deliverable) return sendError(reply, 404, "Deliverable not found");
    if (deliverable.campaign?.brandId !== brand.id) return sendError(reply, 403, "Access denied");

    const updated = await fastify.prisma.campaignDeliverable.update({
      where: { id: request.params.id },
      data: { conversions: request.body.conversions, revenue: request.body.revenue },
    });

    return sendSuccess(reply, updated);
  });

  // Sync YouTube stats on demand
  fastify.post<{ Params: { id: string } }>(
    "/:id/sync",
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const deliverable = await fastify.prisma.campaignDeliverable.findUnique({ where: { id: request.params.id } });
      if (!deliverable) return sendError(reply, 404, "Deliverable not found");
      if (!deliverable.ytVideoId) return sendError(reply, 400, "No YouTube video linked");

      const stats = await fetchYouTubeVideoStats(deliverable.ytVideoId);
      if (!stats) return sendError(reply, 502, "Could not fetch YouTube stats");

      const updated = await fastify.prisma.campaignDeliverable.update({
        where: { id: request.params.id },
        data: {
          ytViews: stats.viewCount,
          ytLikes: stats.likeCount,
          ytComments: stats.commentCount,
          ytLastSynced: new Date(),
        },
      });

      return sendSuccess(reply, updated);
    }
  );

  // Brand: get deliverables for a campaign
  fastify.get<{ Params: { campaignId: string } }>(
    "/campaigns/:campaignId",
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const { sub } = request.user;
      const brand = await fastify.prisma.brandProfile.findUnique({ where: { userId: sub } });
      if (!brand) return sendError(reply, 403, "Brand account required");

      const campaign = await fastify.prisma.campaign.findUnique({ where: { id: request.params.campaignId } });
      if (!campaign || campaign.brandId !== brand.id) return sendError(reply, 404, "Campaign not found");

      const deliverables = await fastify.prisma.campaignDeliverable.findMany({
        where: { campaignId: request.params.campaignId },
        include: {
          influencer: { select: { id: true, displayName: true, avatar: true } },
          application: { select: { id: true, status: true } },
        },
        orderBy: { createdAt: "asc" },
      });

      return sendSuccess(reply, deliverables);
    }
  );

  // Brand: get funnel metrics for a campaign
  fastify.get<{ Params: { campaignId: string } }>(
    "/campaigns/:campaignId/metrics",
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const { sub } = request.user;
      const brand = await fastify.prisma.brandProfile.findUnique({ where: { userId: sub } });
      if (!brand) return sendError(reply, 403, "Brand account required");

      const campaign = await fastify.prisma.campaign.findUnique({ where: { id: request.params.campaignId } });
      if (!campaign || campaign.brandId !== brand.id) return sendError(reply, 404, "Campaign not found");

      const deliverables = await fastify.prisma.campaignDeliverable.findMany({
        where: { campaignId: request.params.campaignId },
        include: {
          influencer: { select: { id: true, displayName: true, avatar: true } },
        },
      });

      const funnel = computeFunnel(deliverables, campaign.budget);

      return sendSuccess(reply, {
        campaign: { id: campaign.id, title: campaign.title, budget: campaign.budget, budgetType: campaign.budgetType },
        deliverables,
        funnel,
      });
    }
  );
};

export async function handleTrackingRedirect(
  prisma: {
    campaignDeliverable: {
      findUnique: (args: unknown) => Promise<{ id: string; targetUrl: string; status: string } | null>;
      update: (args: unknown) => Promise<unknown>;
    };
    deliverableClick: {
      findFirst: (args: unknown) => Promise<unknown>;
      create: (args: unknown) => Promise<unknown>;
    };
  },
  trackingCode: string,
  ip: string
): Promise<string | null> {
  const deliverable = await prisma.campaignDeliverable.findUnique({
    where: { trackingCode },
  } as unknown as Parameters<typeof prisma.campaignDeliverable.findUnique>[0]);

  if (!deliverable || deliverable.status === "ARCHIVED") return null;

  const hash = ipHash(ip);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const existing = await prisma.deliverableClick.findFirst({
    where: { deliverableId: deliverable.id, ipHash: hash, clickedAt: { gte: today } },
  });

  await prisma.deliverableClick.create({
    data: { deliverableId: deliverable.id, ipHash: hash },
  });

  await prisma.campaignDeliverable.update({
    where: { id: deliverable.id },
    data: {
      totalClicks: { increment: 1 },
      ...(existing ? {} : { uniqueClicks: { increment: 1 } }),
    },
  } as unknown as Parameters<typeof prisma.campaignDeliverable.update>[0]);

  return deliverable.targetUrl;
}

export default deliverableRoutes;
