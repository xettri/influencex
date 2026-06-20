import type { FastifyReply } from "fastify";
import type { ApiResponse, PaginatedResponse } from "@influencex/shared";

export function sendSuccess<T>(reply: FastifyReply, data: T, statusCode = 200, message?: string) {
  return reply.code(statusCode).send({
    success: true,
    data,
    message,
  } satisfies ApiResponse<T>);
}

export function sendPaginated<T>(
  reply: FastifyReply,
  items: T[],
  total: number,
  page: number,
  limit: number
) {
  return reply.code(200).send({
    success: true,
    data: {
      items,
      total,
      page,
      limit,
      hasMore: page * limit < total,
    } satisfies PaginatedResponse<T>,
  });
}

export function sendError(reply: FastifyReply, statusCode: number, message: string, code?: string) {
  return reply.code(statusCode).send({
    success: false,
    error: code ?? "ERROR",
    message,
  } satisfies ApiResponse);
}
