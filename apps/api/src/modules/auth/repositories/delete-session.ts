import { eq } from "drizzle-orm";
import { ResultAsync } from "neverthrow";

import { DB, sessions, Transaction } from "../../../db";
import { DBError } from "../../../shared/errors";
import { SessionId } from "../objects/session/session-id";

const _deleteSession =
  (db: DB | Transaction) => async (sessionId: SessionId) => {
    await db.delete(sessions).where(eq(sessions.id, sessionId));
  };

export const deleteSession =
  (db: DB) =>
  (sessionId: SessionId): ResultAsync<void, DBError> => {
    return ResultAsync.fromPromise(
      _deleteSession(db)(sessionId),
      (error) => new DBError("Failed to delete session", { cause: error }),
    );
  };
