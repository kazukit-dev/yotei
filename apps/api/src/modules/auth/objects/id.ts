import { randomUUID } from "crypto";
import { err, ok, Result } from "neverthrow";

import { Brand } from "../../../shared/helpers/brand";

export type UserId = Brand<string, "UserId">;

export const generateUserId = (): UserId => {
  return randomUUID() as UserId;
};

export const createUserId = (value: string): Result<UserId, string> => {
  if (value.length <= 0) return err("UserId cannot be an empty string");
  return ok(value as UserId);
};
