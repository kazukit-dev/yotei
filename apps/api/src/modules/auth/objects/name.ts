import { err, ok, Result } from "neverthrow";

import { Brand } from "../../../shared/helpers/brand";

export const MAX_USER_NAME_LENGTH = 256;

export type UserName = Brand<string, "UserName">;

export const createUserName = (name: string): Result<UserName, string> => {
  if (name.length === 0) return err("User name cannot be empty.");

  if (MAX_USER_NAME_LENGTH < name.length) {
    return err(
      `User name exceeds maximum length of ${MAX_USER_NAME_LENGTH} characters.`,
    );
  }

  return ok(name as UserName);
};
