import { ResultAsync } from "neverthrow";

import { DB, sessions, Transaction } from "../../../db";
import { Session } from "../objects/session/session";

const _saveSession = (db: DB | Transaction) => async (session: Session) => {
  await db.transaction(async (tx) => {
    await tx.insert(sessions).values({
      id: session.id,
      expires_at: session.expires_at,
      user_id: session.user_id,
    });
  });
};

export const saveSession = (db: DB) => {
  return (session: Session) => {
    return ResultAsync.fromPromise(
      _saveSession(db)(session),
      (error) => new Error("Failed to save session.", { cause: error }),
    );
  };
};
