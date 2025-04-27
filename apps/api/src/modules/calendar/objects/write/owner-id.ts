import { err, ok, Result } from "neverthrow";

import { Brand } from "../../../../shared/helpers/brand";

export type OwnerId = Brand<string, "OwnerId">;

export const createOwnerId = (value: string): Result<OwnerId, string> => {
  if (value.length <= 0) {
    return err("UserId cannot be an empty string");
  }
  return ok(value as OwnerId);
};
