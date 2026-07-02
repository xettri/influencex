import type { FastifyPluginAsync } from "fastify";
import { sendSuccess, sendError } from "../utils/response.js";
import type { PaymentType } from "@prisma/client";

const paymentsRoutes: FastifyPluginAsync = async (fastify) => {
  // Brand: lock a payment for an approved application or active hire
  fastify.post<{
    Body: {
      applicationId?: string;
      directHireId?: string;
      amount: number;
      type?: string;
      notes?: string;
    };
  }>("/", { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { sub } = request.user;
    const brand = await fastify.prisma.brandProfile.findUnique({ where: { userId: sub } });
    if (!brand) return sendError(reply, 403, "Brand account required");

    const { applicationId, directHireId, amount, type, notes } = request.body;
    if (!amount || amount <= 0) return sendError(reply, 400, "amount must be a positive number");
    if (!applicationId && !directHireId) return sendError(reply, 400, "applicationId or directHireId required");

    let influencerId: string | undefined;
    let campaignId: string | undefined;

    if (applicationId) {
      const app = await fastify.prisma.campaignApplication.findUnique({
        where: { id: applicationId },
        include: { campaign: true, payment: true },
      });
      if (!app || app.campaign?.brandId !== brand.id) return sendError(reply, 404, "Application not found");
      if (app.status !== "APPROVED") return sendError(reply, 400, "Application must be APPROVED to lock payment");
      if (app.payment) return sendError(reply, 409, "Payment already locked for this application");
      influencerId = app.influencerId;
      campaignId = app.campaignId;
    }

    if (directHireId) {
      const hire = await fastify.prisma.directHire.findUnique({
        where: { id: directHireId },
        include: { payment: true },
      });
      if (!hire || hire.brandId !== brand.id) return sendError(reply, 404, "Hire not found");
      if (!["ACCEPTED", "IN_PROGRESS"].includes(hire.status)) return sendError(reply, 400, "Hire must be ACCEPTED or IN_PROGRESS");
      if (hire.payment) return sendError(reply, 409, "Payment already locked for this hire");
      influencerId = hire.influencerId;
    }

    const payment = await fastify.prisma.payment.create({
      data: {
        campaignId: campaignId ?? null,
        influencerId: influencerId ?? null,
        applicationId: applicationId ?? null,
        directHireId: directHireId ?? null,
        amount,
        status: "LOCKED",
        type: ((type ?? "FLAT_FEE") as PaymentType),
        lockedAt: new Date(),
        notes: notes ?? null,
      },
    });

    return sendSuccess(reply, payment, 201);
  });

  // Creator: get payments they are receiving
  fastify.get("/my", { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { sub } = request.user;
    const profile = await fastify.prisma.influencerProfile.findUnique({ where: { userId: sub } });
    if (!profile) return sendError(reply, 403, "Creator account required");

    const payments = await fastify.prisma.payment.findMany({
      where: { influencerId: profile.id },
      include: {
        campaign: { select: { id: true, title: true, brand: { select: { name: true } } } },
        directHire: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return sendSuccess(reply, payments);
  });

  // Brand: get all payments they have sent (across campaigns + direct hires)
  fastify.get("/sent", { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { sub } = request.user;
    const brand = await fastify.prisma.brandProfile.findUnique({ where: { userId: sub } });
    if (!brand) return sendError(reply, 403, "Brand account required");

    const payments = await fastify.prisma.payment.findMany({
      where: {
        OR: [
          { campaign: { brandId: brand.id } },
          { directHire: { brandId: brand.id } },
        ],
      },
      include: {
        campaign: { select: { id: true, title: true } },
        influencer: { select: { id: true, displayName: true } },
        directHire: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return sendSuccess(reply, payments);
  });

  // Brand: release a locked payment
  fastify.patch<{ Params: { id: string } }>(
    "/:id/release",
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const { sub } = request.user;
      const brand = await fastify.prisma.brandProfile.findUnique({ where: { userId: sub } });
      if (!brand) return sendError(reply, 403, "Brand account required");

      const payment = await fastify.prisma.payment.findUnique({
        where: { id: request.params.id },
        include: {
          campaign: { select: { brandId: true } },
          directHire: { select: { brandId: true } },
        },
      });
      if (!payment) return sendError(reply, 404, "Payment not found");
      if (payment.campaign?.brandId !== brand.id && payment.directHire?.brandId !== brand.id) {
        return sendError(reply, 403, "Access denied");
      }
      if (payment.status !== "LOCKED") return sendError(reply, 400, "Only LOCKED payments can be released");

      const updated = await fastify.prisma.payment.update({
        where: { id: payment.id },
        data: { status: "RELEASED", releasedAt: new Date() },
      });

      return sendSuccess(reply, updated);
    }
  );

  // Brand or creator: dispute a payment
  fastify.patch<{ Params: { id: string }; Body: { notes?: string } }>(
    "/:id/dispute",
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const { sub } = request.user;

      const payment = await fastify.prisma.payment.findUnique({
        where: { id: request.params.id },
        include: {
          campaign: { select: { brandId: true } },
          directHire: { select: { brandId: true } },
        },
      });
      if (!payment) return sendError(reply, 404, "Payment not found");
      if (!["LOCKED", "PENDING"].includes(payment.status)) {
        return sendError(reply, 400, "Payment cannot be disputed in its current state");
      }

      const brand = await fastify.prisma.brandProfile.findUnique({ where: { userId: sub } });
      const profile = await fastify.prisma.influencerProfile.findUnique({ where: { userId: sub } });

      const isBrandParty = brand && (payment.campaign?.brandId === brand.id || payment.directHire?.brandId === brand.id);
      const isCreatorParty = profile && payment.influencerId === profile.id;

      if (!isBrandParty && !isCreatorParty) return sendError(reply, 403, "Access denied");

      const updated = await fastify.prisma.payment.update({
        where: { id: payment.id },
        data: { status: "DISPUTED", notes: request.body.notes ?? payment.notes },
      });

      return sendSuccess(reply, updated);
    }
  );
};

export default paymentsRoutes;
