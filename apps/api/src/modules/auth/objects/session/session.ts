import { err, ok, Result } from "neverthrow";

import { compare } from "../../../../shared/helpers/date";
import { tuple } from "../../../../shared/helpers/tuple";
import { createUserId, UserId } from "../user/user-id";
import { createSessionExpiresAt, SessionExpiresAt } from "./expires";
import { createSessionId, SessionId } from "./session-id";

export interface Session {
  id: SessionId;
  expires_at: SessionExpiresAt;
  user_id: UserId;
}

export const createSession = (value: {
  id: string;
  expiresAt: Date;
  userId: string;
}): Result<Session, string[]> => {
  const id = createSessionId(value.id);
  const expiresAt = createSessionExpiresAt(value.expiresAt);
  const userId = createUserId(value.userId);

  const values = tuple(id, expiresAt, userId);
  return Result.combineWithAllErrors(values).map(([id, expiresAt, userId]) => {
    return {
      id,
      expires_at: expiresAt,
      user_id: userId,
    } as Session;
  });
};

export const isSessionValid = (session: Session): Result<void, string> => {
  if (compare(session.expires_at, "<", new Date())) {
    return err("Session has expired");
  }
  return ok();
};
// railway的にここをどうするか 期限切れエラー→削除
