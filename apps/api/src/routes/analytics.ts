import type { FastifyPluginAsync } from "fastify";
import type { BrandAnalytics, CreatorAnalytics } from "@influencex/shared";
import { sendError } from "../utils/response.js";

const analyticsRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook("preHandler", fastify.authenticate);

  // GET /api/v1/analytics/brand
  fastify.get("/brand", async (request, reply) => {
    const { sub } = request.user;
    const brand = await fastify.prisma.brandProfile.findUnique({ where: { userId: sub } });
    if (!brand) return sendError(reply, 403, "Brand profile not found", "FORBIDDEN");

    const campaigns = await fastify.prisma.campaign.findMany({
      where: { brandId: brand.id },
      include: { _count: { select: { applications: true } } },
      orderBy: { createdAt: "desc" },
    });

    const allApps = await fastify.prisma.campaignApplication.findMany({
      where: { campaign: { brandId: brand.id } },
      select: { status: true, createdAt: true, campaignId: true },
    });

    // Applications over last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentApps = allApps.filter((a) => a.createdAt >= thirtyDaysAgo);
    const byDay: Record<string, number> = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86_400_000);
      byDay[d.toISOString().slice(0, 10)] = 0;
    }
    for (const a of recentApps) {
      const key = a.createdAt.toISOString().slice(0, 10);
      if (key in byDay) byDay[key]++;
    }
    const applicationsOverTime = Object.entries(byDay).map(([date, count]) => ({ date, count }));

    // Applications by status
    const applicationsByStatus: Record<string, number> = {};
    for (const a of allApps) {
      applicationsByStatus[a.status] = (applicationsByStatus[a.status] ?? 0) + 1;
    }

    // Campaigns by status
    const campaignsByStatus: Record<string, number> = {};
    for (const c of campaigns) {
      campaignsByStatus[c.status] = (campaignsByStatus[c.status] ?? 0) + 1;
    }

    // Top campaigns
    const appsByCampaign: Record<string, { approved: number; total: number }> = {};
    for (const a of allApps) {
      if (!appsByCampaign[a.campaignId]) appsByCampaign[a.campaignId] = { approved: 0, total: 0 };
      appsByCampaign[a.campaignId].total++;
      if (a.status === "APPROVED") appsByCampaign[a.campaignId].approved++;
    }
    const topCampaigns = campaigns
      .map((c) => ({
        id: c.id,
        title: c.title,
        applications: appsByCampaign[c.id]?.total ?? 0,
        approved: appsByCampaign[c.id]?.approved ?? 0,
        budget: c.budget,
      }))
      .sort((a, b) => b.applications - a.applications)
      .slice(0, 5);

    const approvedCount = allApps.filter((a) => a.status === "APPROVED").length;
    const activeCampaigns = campaigns.filter((c) => c.status === "ACTIVE");

    const analytics: BrandAnalytics = {
      overview: {
        totalCampaigns: campaigns.length,
        activeCampaigns: activeCampaigns.length,
        totalApplications: allApps.length,
        approvedCount,
        approvalRate: allApps.length > 0 ? Math.round((approvedCount / allApps.length) * 100) : 0,
        totalBudgetActive: activeCampaigns.reduce((s, c) => s + c.budget, 0),
      },
      applicationsByStatus,
      campaignsByStatus,
      applicationsOverTime,
      topCampaigns,
    };

    return reply.send(analytics);
  });

  // GET /api/v1/analytics/creator
  fastify.get("/creator", async (request, reply) => {
    const { sub } = request.user;
    const influencer = await fastify.prisma.influencerProfile.findUnique({ where: { userId: sub } });
    if (!influencer) return sendError(reply, 403, "Creator profile not found", "FORBIDDEN");

    const applications = await fastify.prisma.campaignApplication.findMany({
      where: { influencerId: influencer.id },
      include: {
        campaign: {
          select: { id: true, title: true, budget: true, brand: { select: { name: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const directHires = await fastify.prisma.directHire.count({
      where: { influencerId: influencer.id, status: { in: ["ACCEPTED", "IN_PROGRESS", "COMPLETED"] } },
    });

    // Applications by status
    const applicationsByStatus: Record<string, number> = {};
    for (const a of applications) {
      applicationsByStatus[a.status] = (applicationsByStatus[a.status] ?? 0) + 1;
    }

    // Activity by month (last 6 months)
    const activityByMonth: { month: string; applications: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i, 1);
      const label = d.toLocaleString("en-IN", { month: "short", year: "2-digit" });
      const monthStr = d.toISOString().slice(0, 7);
      const count = applications.filter((a) => a.createdAt.toISOString().startsWith(monthStr)).length;
      activityByMonth.push({ month: label, applications: count });
    }

    // Earnings pipeline (approved + in-progress applications)
    const earningsPipeline = applications
      .filter((a) => ["APPROVED", "SHORTLISTED"].includes(a.status))
      .map((a) => ({
        campaignId: a.campaignId,
        title: a.campaign.title,
        brand: a.campaign.brand.name,
        budget: a.campaign.budget,
        status: a.status,
      }));

    const approvedCount = applications.filter((a) => a.status === "APPROVED").length;
    const estimatedEarnings = earningsPipeline
      .filter((e) => e.status === "APPROVED")
      .reduce((s, e) => s + e.budget * 0.1, 0); // ~10% of campaign budget per creator

    const analytics: CreatorAnalytics = {
      overview: {
        totalApplications: applications.length,
        approvedCount,
        approvalRate: applications.length > 0 ? Math.round((approvedCount / applications.length) * 100) : 0,
        pendingCount: applicationsByStatus["PENDING"] ?? 0,
        estimatedEarnings,
        directHires,
      },
      applicationsByStatus,
      earningsPipeline,
      activityByMonth,
    };

    return reply.send(analytics);
  });
};

export default analyticsRoutes;
