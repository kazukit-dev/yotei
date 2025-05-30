import { and, eq } from "drizzle-orm";
import { err, Result, ResultAsync } from "neverthrow";

import { accounts, DB, userEmail, users } from "../../../db";
import {
  DBError,
  EntityNotFound,
  ValidationError,
} from "../../../shared/errors";
import { tuple } from "../../../shared/helpers/tuple";
import {
  Account,
  AccountId,
  createAccount,
  ProviderId,
} from "../objects/account";
import { createUser, Email, User } from "../objects/user";

export const _findOauthUser =
  (db: DB) =>
  async (providerId: ProviderId, accountId: AccountId, email: Email) => {
    const oauthUsers = await db
      .select({
        id: users.id,
        name: users.name,
        email: userEmail.email,
        providerId: accounts.provider_id,
        accountId: accounts.account_id,
      })
      .from(users)
      .innerJoin(userEmail, eq(users.id, userEmail.user_id))
      .innerJoin(accounts, eq(users.id, accounts.user_id))
      .where(
        and(
          eq(accounts.provider_id, providerId),
          eq(accounts.account_id, accountId),
          eq(userEmail.email, email),
        ),
      )
      .limit(1);

    if (!oauthUsers.length) return null;

    const oauthUser = oauthUsers[0];
    const user = {
      id: oauthUser.id,
      name: oauthUser.name,
      email: oauthUser.email,
    };
    const account = {
      provider_id: oauthUser.providerId,
      account_id: oauthUser.accountId,
    };
    return { user, account };
  };

export const findOauthUser =
  (db: DB) =>
  (
    providerId: ProviderId,
    accountId: AccountId,
    email: Email,
  ): ResultAsync<
    { user: User; account: Account },
    DBError | ValidationError | EntityNotFound
  > => {
    return ResultAsync.fromPromise(
      _findOauthUser(db)(providerId, accountId, email),
      (err) => new DBError("Failed to find oauth user", { cause: err }),
    ).andThen((oauthUser) => {
      console.log("************************* ??");
      if (!oauthUser) {
        return err(
          new EntityNotFound(
            `OAuth user not found for provider ${providerId} and account ${accountId}`,
          ),
        );
      }

      const user = createUser(oauthUser.user);
      const account = createAccount(oauthUser.account);
      const values = tuple(user, account);
      return Result.combineWithAllErrors(values)
        .map(([user, account]) => {
          return { user, account };
        })
        .mapErr((errors) => new ValidationError(errors.flat()));
    });
  };
