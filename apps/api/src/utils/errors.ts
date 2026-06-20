export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const Errors = {
  notFound: (resource: string) => new AppError(404, `${resource} not found`, "NOT_FOUND"),
  unauthorized: (msg = "Unauthorized") => new AppError(401, msg, "UNAUTHORIZED"),
  forbidden: (msg = "Forbidden") => new AppError(403, msg, "FORBIDDEN"),
  badRequest: (msg: string) => new AppError(400, msg, "BAD_REQUEST"),
  conflict: (msg: string) => new AppError(409, msg, "CONFLICT"),
  internal: (msg = "Internal server error") => new AppError(500, msg, "INTERNAL_ERROR"),
};
