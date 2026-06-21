import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import jwt from "@fastify/jwt";
import rateLimit from "@fastify/rate-limit";

import prismaPlugin from "./plugins/prisma.js";
import authGuard from "./plugins/auth-guard.js";
import authRoutes from "./routes/auth.js";
import waitlistRoutes from "./routes/waitlist.js";
import campaignRoutes from "./routes/campaigns.js";
import influencerRoutes from "./routes/influencers.js";
import hireRoutes from "./routes/hires.js";
import adminRoutes from "./routes/admin.js";
import { sendError } from "./utils/response.js";

const fastify = Fastify({
  logger: {
    level: process.env.NODE_ENV === "production" ? "warn" : "info",
    transport:
      process.env.NODE_ENV !== "production"
        ? { target: "pino-pretty", options: { colorize: true } }
        : undefined,
  },
});

async function bootstrap() {
  await fastify.register(helmet, { contentSecurityPolicy: false });

  await fastify.register(cors, {
    origin: process.env.FRONTEND_URL ?? "http://localhost:5173",
    credentials: true,
  });

  await fastify.register(rateLimit, {
    max: 100,
    timeWindow: "1 minute",
  });

  await fastify.register(jwt, {
    secret: process.env.JWT_SECRET ?? "change-this-secret-in-production",
  });

  await fastify.register(prismaPlugin);
  await fastify.register(authGuard);

  fastify.get("/health", async () => ({ status: "ok", timestamp: new Date().toISOString() }));

  await fastify.register(authRoutes, { prefix: "/api/v1/auth" });
  await fastify.register(waitlistRoutes, { prefix: "/api/v1/waitlist" });
  await fastify.register(campaignRoutes, { prefix: "/api/v1/campaigns" });
  await fastify.register(influencerRoutes, { prefix: "/api/v1/influencers" });
  await fastify.register(hireRoutes, { prefix: "/api/v1/hires" });
  await fastify.register(adminRoutes, { prefix: "/api/v1/admin" });

  fastify.setErrorHandler((error: { statusCode?: number; message: string }, _request, reply) => {
    fastify.log.error(error);
    return sendError(reply, error.statusCode ?? 500, error.message, "INTERNAL_ERROR");
  });

  const port = Number(process.env.PORT ?? 3001);
  const host = process.env.HOST ?? "0.0.0.0";

  await fastify.listen({ port, host });
  console.log(`API running at http://${host}:${port}`);
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
