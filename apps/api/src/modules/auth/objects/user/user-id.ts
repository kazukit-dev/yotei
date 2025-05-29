import { err, ok, Result } from "neverthrow";

import { Brand } from "../../../../shared/helpers/brand";

export type UserId = Brand<string, "UserId">;

export const generateUserId = () => {
  return crypto.randomUUID() as UserId;
};

export const createUserId = (value: string): Result<UserId, string> => {
  if (value.length <= 0) {
    return err("InvalidUserId");
  }
  return ok(value as UserId);
};
