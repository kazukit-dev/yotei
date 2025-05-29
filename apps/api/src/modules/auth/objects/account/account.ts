import { Result } from "neverthrow";
import { tuple } from "../../../../shared/helpers/tuple";
import { AccountId, createAccountId } from "./account-id";
import { createProviderId, ProviderId } from "./provider-id";

export type Account = {
  provider_id: ProviderId;
  account_id: AccountId;
};

export const createAccount = (dto: {
  provider_id: string;
  account_id: string;
}): Result<Account, string[]> => {
  const accountId = createAccountId(dto.account_id);
  const providerId = createProviderId(dto.provider_id);
  const values = tuple(accountId, providerId);

  return Result.combineWithAllErrors(values).map(([accountId, providerId]) => {
    return {
      account_id: accountId,
      provider_id: providerId,
    };
  });
};
