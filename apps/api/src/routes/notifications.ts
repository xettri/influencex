import type { FastifyPluginAsync } from "fastify";

const notificationsRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook("preHandler", fastify.authenticate);

  // GET /api/v1/notifications — list for the authenticated user
  fastify.get("/", async (request, reply) => {
    const { sub } = request.user;
    const notifications = await fastify.prisma.notification.findMany({
      where: { userId: sub },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return reply.send(notifications);
  });

  // GET /api/v1/notifications/unread-count
  fastify.get("/unread-count", async (request, reply) => {
    const { sub } = request.user;
    const count = await fastify.prisma.notification.count({
      where: { userId: sub, read: false },
    });
    return reply.send({ count });
  });

  // PATCH /api/v1/notifications/read-all — must come before /:id
  fastify.patch("/read-all", async (request, reply) => {
    const { sub } = request.user;
    await fastify.prisma.notification.updateMany({
      where: { userId: sub, read: false },
      data: { read: true },
    });
    return reply.send({ success: true });
  });

  // PATCH /api/v1/notifications/:id/read
  fastify.patch<{ Params: { id: string } }>("/:id/read", async (request, reply) => {
    const { sub } = request.user;
    const notification = await fastify.prisma.notification.findFirst({
      where: { id: request.params.id, userId: sub },
    });
    if (!notification) return reply.status(404).send({ error: "Not found" });

    const updated = await fastify.prisma.notification.update({
      where: { id: request.params.id },
      data: { read: true },
    });
    return reply.send(updated);
  });

  // DELETE /api/v1/notifications/:id
  fastify.delete<{ Params: { id: string } }>("/:id", async (request, reply) => {
    const { sub } = request.user;
    const notification = await fastify.prisma.notification.findFirst({
      where: { id: request.params.id, userId: sub },
    });
    if (!notification) return reply.status(404).send({ error: "Not found" });

    await fastify.prisma.notification.delete({ where: { id: request.params.id } });
    return reply.send({ success: true });
  });
};

export default notificationsRoutes;
