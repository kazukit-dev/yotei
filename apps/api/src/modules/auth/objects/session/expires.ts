import dayjs from "dayjs";
import { Brand } from "../../../../shared/helpers/brand";
import { err, Ok, ok, Result } from "neverthrow";

export type SessionExpiresAt = Brand<Date, "SessionExpiresAt">;

export type SessionMaxAge = Brand<number, "SessionMaxAge">;

export const generateSessionExpiresAt = (): SessionExpiresAt => {
  return dayjs().add(1, "day").toDate() as SessionExpiresAt;
};

export const generateSessionMaxAge = (): SessionMaxAge => {
  const maxAge = 60 * 60 * 24;
  return maxAge as SessionMaxAge;
};

export const createSessionExpiresAt = (
  value: Date,
): Ok<SessionExpiresAt, never> => {
  return ok(value as SessionExpiresAt);
};

export const createSessionMaxAge = (
  value: number,
): Result<SessionMaxAge, string> => {
  if (!value) return err("InvalidMaxAge");
  return ok(value as SessionMaxAge);
};
