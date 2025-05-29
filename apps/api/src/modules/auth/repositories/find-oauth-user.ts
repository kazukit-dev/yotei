import { and, eq } from "drizzle-orm";
import { accounts, DB, userEmail, users } from "../../../db";
import {
  Account,
  AccountId,
  createAccount,
  ProviderId,
} from "../objects/account";
import { createUser, Email, User } from "../objects/user";
import { err, Result, ResultAsync } from "neverthrow";
import {
  DBError,
  EntityNotFound,
  ValidationError,
} from "../../../shared/errors";
import { tuple } from "../../../shared/helpers/tuple";

export const _findOauthUser =
  (db: DB) =>
  async (providerId: ProviderId, accountId: AccountId, email: Email) => {
    const oauthUser = await db
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
      );

    if (!oauthUser.length) return null;
    const user = {
      id: oauthUser[0].id,
      name: oauthUser[0].name,
      email: oauthUser[0].email,
    };
    const account = {
      provider_id: oauthUser[0].providerId,
      account_id: oauthUser[0].accountId,
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
