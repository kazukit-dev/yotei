import type { ErrorHandler } from "hono";

import {
  AppError,
  EntityNotFound,
  ForbiddenError,
  ValidationError,
} from "./common/errors";

export const errorHandler: ErrorHandler = (err, c) => {
  if (!(err instanceof AppError)) {
    console.error("InternalServerError", err);
    return c.json("InternalServerError", 500);
  }

  if (err instanceof ValidationError) {
    return c.json(err.errors, 400);
  }

  if (err instanceof ForbiddenError) {
    return c.json(err.message, 403);
  }

  if (err instanceof EntityNotFound) {
    return c.json(err.message, 404);
  }

  console.error("InternalServerError", err);
  return c.json(err.message, 500);
};
