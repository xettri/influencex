import type { FastifyPluginAsync } from "fastify";
import { RegisterSchema, LoginSchema, RefreshTokenSchema } from "@influencex/shared";
import { AuthService } from "../services/auth.service.js";
import { sendSuccess, sendError } from "../utils/response.js";
import { AppError } from "../utils/errors.js";

const authRoutes: FastifyPluginAsync = async (fastify) => {
  const authService = new AuthService(fastify.prisma, fastify);

  fastify.post("/register", async (request, reply) => {
    const result = RegisterSchema.safeParse(request.body);
    if (!result.success) {
      return sendError(reply, 400, result.error.errors[0]?.message ?? "Validation error", "VALIDATION_ERROR");
    }
    try {
      const data = await authService.register(result.data);
      return sendSuccess(reply, data, 201, "Account created successfully");
    } catch (err) {
      if (err instanceof AppError) return sendError(reply, err.statusCode, err.message, err.code);
      throw err;
    }
  });

  fastify.post("/login", async (request, reply) => {
    const result = LoginSchema.safeParse(request.body);
    if (!result.success) {
      return sendError(reply, 400, result.error.errors[0]?.message ?? "Validation error", "VALIDATION_ERROR");
    }
    try {
      const data = await authService.login(result.data);
      return sendSuccess(reply, data, 200, "Login successful");
    } catch (err) {
      if (err instanceof AppError) return sendError(reply, err.statusCode, err.message, err.code);
      throw err;
    }
  });

  fastify.post("/refresh", async (request, reply) => {
    const result = RefreshTokenSchema.safeParse(request.body);
    if (!result.success) {
      return sendError(reply, 400, "Refresh token required", "VALIDATION_ERROR");
    }
    try {
      const data = await authService.refresh(result.data.refreshToken);
      return sendSuccess(reply, data);
    } catch (err) {
      if (err instanceof AppError) return sendError(reply, err.statusCode, err.message, err.code);
      throw err;
    }
  });

  fastify.post("/logout", async (request, reply) => {
    const result = RefreshTokenSchema.safeParse(request.body);
    if (result.success) await authService.logout(result.data.refreshToken);
    return sendSuccess(reply, null, 200, "Logged out successfully");
  });
};

export default authRoutes;
