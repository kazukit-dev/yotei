import { createMiddleware } from "hono/factory";
import { ok } from "neverthrow";
import { createSessionId } from "../objects/session/session-id";
import { findSession } from "../repositories/find-session";
import { createDBClient } from "../../../db";
import { AuthError } from "../../../shared/errors";
import { getSession } from "../api/session";
import { AuthenticatedEnv } from "../../../shared/hono";
import { isSessionValid, Session } from "../objects/session/session";

export const validateSession = (session: Session) => {
  return ok(session)
    .andThen(isSessionValid)
    .mapErr((err) => new AuthError(err));
};

export const authenticate = createMiddleware<AuthenticatedEnv>(
  async (c, next) => {
    const sessionId = await getSession(c);
    const db = createDBClient(c.env.DATABASE_URL);

    return await ok(sessionId)
      .andThen(createSessionId)
      .asyncAndThen(findSession(db))
      .andThrough(validateSession)
      .match(
        async (result) => {
          c.set("userId", result.user_id);
          await next();
        },
        (err) => {
          throw new AuthError("Failed to authenticate", { cause: err });
        },
      );
  },
);
