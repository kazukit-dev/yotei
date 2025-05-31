import { createMiddleware } from "hono/factory";
import { err, ok, okAsync } from "neverthrow";

import { AuthenticatedEnv } from "../../../env";
import { AuthError, ValidationError } from "../../../shared/errors";
import { clearSession, getSession } from "../api/session";
import { isSessionValid } from "../objects/session/session";
import { createSessionId } from "../objects/session/session-id";
import { deleteSession } from "../repositories/delete-session";
import { findSession } from "../repositories/find-session";

class SessionNotFoundError extends AuthError {}

export const authenticate = createMiddleware<AuthenticatedEnv>(
  async (c, next) => {
    const db = c.get("db");
    const sessionId = await getSession(c);

    console.log("Session ID:", sessionId);

    const preprocess = ok(sessionId)
      .andThen(createSessionId)
      .mapErr((err) => new ValidationError([err]))
      .asyncAndThen(findSession(db));

    return await preprocess
      .andThrough((session) => {
        const result = isSessionValid(session);
        return result.isOk()
          ? okAsync(session)
          : deleteSession(db)(session.id).andThen(() =>
              err(new SessionNotFoundError("Session was invalid or expired")),
            );
      })
      .match(
        async (result) => {
          c.set("userId", result.user_id);
          await next();
        },
        (err) => {
          console.log("error", err);
          clearSession(c);
          throw new AuthError("Failed to authenticate", { cause: err });
        },
      );
  },
);
