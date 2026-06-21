import type { FastifyPluginAsync } from "fastify";
import { CreateDirectHireSchema, UpdateHireStatusSchema } from "@influencex/shared";
import { sendSuccess, sendError } from "../utils/response.js";

const hireRoutes: FastifyPluginAsync = async (fastify) => {

  // POST /hires — brand creates a direct hire request
  fastify.post("/", { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { sub } = request.user;

    const brand = await fastify.prisma.brandProfile.findUnique({ where: { userId: sub } });
    if (!brand) return sendError(reply, 403, "Brand profile required", "FORBIDDEN");

    const result = CreateDirectHireSchema.safeParse(request.body);
    if (!result.success) {
      return sendError(reply, 400, result.error.errors[0]?.message ?? "Validation error", "VALIDATION_ERROR");
    }

    const influencer = await fastify.prisma.influencerProfile.findUnique({
      where: { id: result.data.influencerId },
    });
    if (!influencer) return sendError(reply, 404, "Influencer not found", "NOT_FOUND");

    const hire = await fastify.prisma.directHire.create({
      data: {
        brandId: brand.id,
        influencerId: result.data.influencerId,
        title: result.data.title,
        description: result.data.description,
        budget: result.data.budget,
        deliverables: result.data.deliverables,
        deadline: result.data.deadline ? new Date(result.data.deadline) : undefined,
        brandMessage: result.data.brandMessage,
      },
      include: {
        influencer: { select: { displayName: true, avatar: true } },
        brand: { select: { name: true, logo: true } },
      },
    });

    return sendSuccess(reply, hire, 201, "Hire request sent");
  });

  // GET /hires/my — hires relevant to the current user
  fastify.get("/my", { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { sub } = request.user;
    const user = await fastify.prisma.user.findUnique({
      where: { id: sub },
      select: { role: true, brand: { select: { id: true } }, influencer: { select: { id: true } } },
    });
    if (!user) return sendError(reply, 404, "User not found", "NOT_FOUND");

    if (user.role === "BRAND" && user.brand) {
      const hires = await fastify.prisma.directHire.findMany({
        where: { brandId: user.brand.id },
        include: {
          influencer: { select: { id: true, displayName: true, avatar: true, verified: true, niche: true } },
        },
        orderBy: { createdAt: "desc" },
      });
      return sendSuccess(reply, hires);
    }

    if (user.influencer) {
      const hires = await fastify.prisma.directHire.findMany({
        where: { influencerId: user.influencer.id },
        include: {
          brand: { select: { id: true, name: true, logo: true, verified: true, industry: true } },
        },
        orderBy: { createdAt: "desc" },
      });
      return sendSuccess(reply, hires);
    }

    return sendSuccess(reply, []);
  });

  // GET /hires/:id — get single hire
  fastify.get("/:id", { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { sub } = request.user;
    const { id } = request.params as { id: string };

    const hire = await fastify.prisma.directHire.findUnique({
      where: { id },
      include: {
        influencer: { select: { id: true, displayName: true, avatar: true, verified: true, niche: true, platforms: true } },
        brand: { select: { id: true, name: true, logo: true, verified: true, industry: true } },
      },
    });
    if (!hire) return sendError(reply, 404, "Hire not found", "NOT_FOUND");

    // Check access
    const user = await fastify.prisma.user.findUnique({
      where: { id: sub },
      select: { brand: { select: { id: true } }, influencer: { select: { id: true } } },
    });
    const hasAccess =
      hire.brandId === user?.brand?.id || hire.influencerId === user?.influencer?.id;
    if (!hasAccess) return sendError(reply, 403, "Access denied", "FORBIDDEN");

    return sendSuccess(reply, hire);
  });

  // PATCH /hires/:id/status — influencer accepts/declines; brand cancels
  fastify.patch("/:id/status", { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { sub } = request.user;
    const { id } = request.params as { id: string };

    const result = UpdateHireStatusSchema.safeParse(request.body);
    if (!result.success) {
      return sendError(reply, 400, result.error.errors[0]?.message ?? "Validation error", "VALIDATION_ERROR");
    }

    const hire = await fastify.prisma.directHire.findUnique({ where: { id } });
    if (!hire) return sendError(reply, 404, "Hire not found", "NOT_FOUND");

    const user = await fastify.prisma.user.findUnique({
      where: { id: sub },
      select: { brand: { select: { id: true } }, influencer: { select: { id: true } } },
    });

    const isBrand = hire.brandId === user?.brand?.id;
    const isInfluencer = hire.influencerId === user?.influencer?.id;

    if (!isBrand && !isInfluencer) return sendError(reply, 403, "Access denied", "FORBIDDEN");

    const { status } = result.data;

    // Enforce allowed transitions
    if (status === "CANCELLED" && !isBrand) {
      return sendError(reply, 403, "Only the brand can cancel a hire", "FORBIDDEN");
    }
    if ((status === "ACCEPTED" || status === "DECLINED") && !isInfluencer) {
      return sendError(reply, 403, "Only the influencer can accept or decline", "FORBIDDEN");
    }

    const updated = await fastify.prisma.directHire.update({
      where: { id },
      data: { status },
    });

    return sendSuccess(reply, updated, 200, `Hire ${status.toLowerCase()}`);
  });
};

export default hireRoutes;
