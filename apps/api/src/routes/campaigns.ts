import type { FastifyPluginAsync } from "fastify";
import type { Prisma } from "@prisma/client";
import {
  CreateCampaignSchema,
  UpdateCampaignSchema,
  ApplyCampaignSchema,
} from "@influencex/shared";
import { sendSuccess, sendPaginated, sendError } from "../utils/response.js";

const campaignRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /campaigns — public list of active campaigns with optional search + filter
  fastify.get("/", async (request, reply) => {
    const q = request.query as {
      page?: string;
      limit?: string;
      search?: string;
      budgetType?: string;
    };
    const page = Math.max(1, Number(q.page ?? 1));
    const limit = Math.min(50, Math.max(1, Number(q.limit ?? 20)));

    const where: Prisma.CampaignWhereInput = { status: "ACTIVE" };

    if (q.budgetType && ["FLAT_FEE", "CPA", "MIXED"].includes(q.budgetType)) {
      where.budgetType = q.budgetType as "FLAT_FEE" | "CPA" | "MIXED";
    }

    if (q.search?.trim()) {
      where.title = { contains: q.search.trim(), mode: "insensitive" };
    }

    const [campaigns, total] = await Promise.all([
      fastify.prisma.campaign.findMany({
        where,
        include: {
          brand: { select: { name: true, logo: true, industry: true, verified: true } },
          _count: { select: { applications: true } },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      fastify.prisma.campaign.count({ where }),
    ]);

    return sendPaginated(reply, campaigns, total, page, limit);
  });

  // GET /campaigns/my — brand's own campaigns (auth required)
  fastify.get("/my", { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { sub } = request.user;
    const brand = await fastify.prisma.brandProfile.findUnique({ where: { userId: sub } });
    if (!brand) return sendError(reply, 403, "Brand profile required", "FORBIDDEN");

    const campaigns = await fastify.prisma.campaign.findMany({
      where: { brandId: brand.id },
      include: { _count: { select: { applications: true } } },
      orderBy: { createdAt: "desc" },
    });
    return sendSuccess(reply, campaigns);
  });

  // GET /campaigns/:id — single campaign
  fastify.get("/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const campaign = await fastify.prisma.campaign.findUnique({
      where: { id },
      include: {
        brand: { select: { name: true, logo: true, website: true, industry: true, verified: true } },
        _count: { select: { applications: true } },
      },
    });
    if (!campaign) return sendError(reply, 404, "Campaign not found", "NOT_FOUND");
    return sendSuccess(reply, campaign);
  });

  // POST /campaigns — create campaign (brand only)
  fastify.post("/", { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { sub } = request.user;
    const brand = await fastify.prisma.brandProfile.findUnique({ where: { userId: sub } });
    if (!brand) return sendError(reply, 403, "Brand profile required", "FORBIDDEN");

    const result = CreateCampaignSchema.safeParse(request.body);
    if (!result.success) {
      return sendError(reply, 400, result.error.errors[0]?.message ?? "Validation error", "VALIDATION_ERROR");
    }

    const campaign = await fastify.prisma.campaign.create({
      data: {
        title: result.data.title,
        description: result.data.description,
        budget: result.data.budget,
        budgetType: result.data.budgetType,
        criteria: result.data.criteria,
        brandId: brand.id,
        startDate: result.data.startDate ? new Date(result.data.startDate) : undefined,
        endDate: result.data.endDate ? new Date(result.data.endDate) : undefined,
      },
    });
    return sendSuccess(reply, campaign, 201, "Campaign created");
  });

  // PATCH /campaigns/:id — update campaign (brand owner only)
  fastify.patch("/:id", { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { sub } = request.user;
    const { id } = request.params as { id: string };

    const brand = await fastify.prisma.brandProfile.findUnique({ where: { userId: sub } });
    if (!brand) return sendError(reply, 403, "Brand profile required", "FORBIDDEN");

    const campaign = await fastify.prisma.campaign.findUnique({ where: { id } });
    if (!campaign) return sendError(reply, 404, "Campaign not found", "NOT_FOUND");
    if (campaign.brandId !== brand.id) return sendError(reply, 403, "Not authorized", "FORBIDDEN");

    const result = UpdateCampaignSchema.safeParse(request.body);
    if (!result.success) {
      return sendError(reply, 400, result.error.errors[0]?.message ?? "Validation error", "VALIDATION_ERROR");
    }

    const updated = await fastify.prisma.campaign.update({
      where: { id },
      data: {
        ...result.data,
        startDate: result.data.startDate ? new Date(result.data.startDate) : undefined,
        endDate: result.data.endDate ? new Date(result.data.endDate) : undefined,
      },
    });
    return sendSuccess(reply, updated);
  });

  // POST /campaigns/:id/apply — apply to campaign (influencer only)
  fastify.post("/:id/apply", { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { sub } = request.user;
    const { id } = request.params as { id: string };

    const influencer = await fastify.prisma.influencerProfile.findUnique({ where: { userId: sub } });
    if (!influencer) return sendError(reply, 403, "Influencer profile required", "FORBIDDEN");

    const campaign = await fastify.prisma.campaign.findUnique({ where: { id } });
    if (!campaign) return sendError(reply, 404, "Campaign not found", "NOT_FOUND");
    if (campaign.status !== "ACTIVE") {
      return sendError(reply, 400, "Campaign is not accepting applications", "BAD_REQUEST");
    }

    const result = ApplyCampaignSchema.safeParse(request.body);
    if (!result.success) {
      return sendError(reply, 400, result.error.errors[0]?.message ?? "Validation error", "VALIDATION_ERROR");
    }

    try {
      const application = await fastify.prisma.campaignApplication.create({
        data: { campaignId: id, influencerId: influencer.id, pitch: result.data.pitch },
      });
      return sendSuccess(reply, application, 201, "Application submitted");
    } catch (err: unknown) {
      if ((err as { code?: string }).code === "P2002") {
        return sendError(reply, 409, "Already applied to this campaign", "CONFLICT");
      }
      throw err;
    }
  });
};

export default campaignRoutes;
