import { err, ResultAsync } from "neverthrow";
import { DB, sessions, userEmail, users } from "../../../db";
import { SessionId } from "../objects/session/session-id";
import {
  DBError,
  EntityNotFound,
  ValidationError,
} from "../../../shared/errors";
import { eq } from "drizzle-orm";
import { createSession, Session } from "../objects/session/session";

const _findSession =
  (db: DB) =>
  async (
    sessionId: SessionId,
  ): Promise<{
    id: string;
    userId: string;
    expiresAt: Date;
  } | null> => {
    const session = await db
      .select({
        id: sessions.id,
        userId: sessions.user_id,
        expiresAt: sessions.expires_at,
      })
      .from(sessions)
      .innerJoin(userEmail, eq(userEmail.user_id, users.id))
      .where(eq(sessions.id, sessionId));

    return session.length ? session[0] : null;
  };

export const findSession =
  (db: DB) =>
  (
    sessionId: SessionId,
  ): ResultAsync<Session, DBError | EntityNotFound | ValidationError> => {
    return ResultAsync.fromPromise(
      _findSession(db)(sessionId),
      (err) => new DBError("Failed to find session", { cause: err }),
    ).andThen((result) =>
      result
        ? createSession(result).mapErr((errs) => new ValidationError(errs))
        : err(new EntityNotFound("Not found session")),
    );
  };
