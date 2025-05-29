import { err, ok, Result } from "neverthrow";
import { Brand } from "../../../../shared/helpers/brand";

export type AccountId = Brand<string, "AccountId">;

export const createAccountId = (value: string): Result<AccountId, string> => {
  if (!value.length) {
    return err("AccountId cannot be empty");
  }
  return ok(value as AccountId);
};
