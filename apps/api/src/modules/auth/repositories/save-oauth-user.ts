import { ResultAsync } from "neverthrow";

import { accounts, DB, userEmail, users } from "../../../db";
import { DBError } from "../../../shared/errors";
import { Account } from "../objects/account";
import { User } from "../objects/user";

const _saveOauthUser =
  (db: DB) =>
  async (user: User, account: Account): Promise<void> => {
    await db.transaction(async (tx) => {
      await tx.insert(users).values({
        id: user.id,
        name: user.name,
      });

      await tx.insert(userEmail).values({
        user_id: user.id,
        email: user.email,
      });

      await tx.insert(accounts).values({
        provider_id: account.provider_id,
        account_id: account.account_id,
        user_id: user.id,
      });
    });
  };

export const saveOauthUser =
  (db: DB) =>
  (user: User, account: Account): ResultAsync<void, DBError> => {
    return ResultAsync.fromPromise(
      _saveOauthUser(db)(user, account),
      (err) => new DBError("Failed to save oauth user", { cause: err }),
    );
  };
