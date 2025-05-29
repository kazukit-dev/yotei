import { err, ok, Result } from "neverthrow";
import { Brand } from "../../../../shared/helpers/brand";

export type SessionId = Brand<string, "SessionId">;

export const generateSessionId = () => {
  return crypto.randomUUID() as SessionId;
};

export const createSessionId = (
  value: string | null,
): Result<SessionId, string> => {
  if (!value) {
    return err("InvalidSessionId");
  }
  return ok(value as SessionId);
};
