import type { ErrorHandler } from "hono";

import {
  AppError,
  AuthError,
  EntityNotFound,
  ForbiddenError,
  ValidationError,
} from "./shared/errors";

export const errorHandler: ErrorHandler = (err, c) => {
  if (!(err instanceof AppError)) {
    console.error("InternalServerError", err);
    return c.json("InternalServerError", 500);
  }

  if (err instanceof ValidationError) {
    return c.json(err.errors, 400);
  }

  if (err instanceof AuthError) {
    return c.json(err.message, 401);
  }

  if (err instanceof ForbiddenError) {
    return c.json(err.message, 403);
  }

  if (err instanceof EntityNotFound) {
    return c.json(err.message, 404);
  }

  console.error("An unexpected error occurred", err);
  return c.json(err.message, 500);
};
