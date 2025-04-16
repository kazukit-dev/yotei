import { eq } from "drizzle-orm";
import { ResultAsync } from "neverthrow";

import { DB, userToken } from "../../../db";
import { DBError } from "../../../shared/errors";
import { HashedRefreshToken } from "../objects/token";

type RevokedToken = {
  kind: "revoked";
  token: HashedRefreshToken;
};

export const deleteToken = (db: DB) => async (model: RevokedToken) => {
  await db.delete(userToken).where(eq(userToken.token, model.token));
};

export const revokeToken =
  (db: DB) =>
  (model: RevokedToken): ResultAsync<void, DBError> => {
    return ResultAsync.fromPromise(
      deleteToken(db)(model),
      (err) => new DBError("Failed to revoke token", { cause: err }),
    );
  };
