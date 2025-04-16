import { ResultAsync } from "neverthrow";

import { DB, userToken } from "../../../db";
import { DBError } from "../../../shared/errors";
import { UserId } from "../objects/id";
import { HashedRefreshToken } from "../objects/token";

type CreatedUserToken = {
  kind: "created";
  userId: UserId;
  token: HashedRefreshToken;
  expiresAt: Date;
};

export const createUserToken =
  (db: DB) =>
  async ({ kind: _, ...model }: CreatedUserToken) => {
    await db
      .insert(userToken)
      .values({
        user_id: model.userId,
        token: model.token,
        expires_at: model.expiresAt,
      })
      .returning();
  };

export const saveCreatedUserToken =
  (db: DB) =>
  (model: CreatedUserToken): ResultAsync<void, DBError> => {
    return ResultAsync.fromPromise(
      createUserToken(db)(model),
      (error) =>
        new DBError(`Failed to save user token: ${error}`, { cause: error }),
    );
  };
