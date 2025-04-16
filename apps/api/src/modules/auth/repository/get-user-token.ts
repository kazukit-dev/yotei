import { eq } from "drizzle-orm";
import { err, ok, ResultAsync } from "neverthrow";

import { DB, userToken } from "../../../db";
import {
  DBError,
  EntityNotFound,
  ValidationError,
} from "../../../shared/errors";
import { HashedRefreshToken } from "../objects/token";
import { createUserToken, UserToken } from "../objects/user-token";

export const findUserTokenByToken =
  (db: DB) => async (token: HashedRefreshToken) => {
    const _userToken = await db
      .select({
        userId: userToken.user_id,
        token: userToken.token,
        expiresAt: userToken.expires_at,
      })
      .from(userToken)
      .where(eq(userToken.token, token));

    return _userToken.length > 0 ? _userToken[0] : undefined;
  };

export const getUserTokenByToken =
  (db: DB) =>
  (
    token: HashedRefreshToken,
  ): ResultAsync<UserToken, ValidationError | DBError | EntityNotFound> => {
    return ResultAsync.fromPromise(
      findUserTokenByToken(db)(token),
      (err) => new DBError("Failed to find user token", { cause: err }),
    )
      .andThen((_userToken) => {
        return _userToken ? ok(_userToken) : err(new EntityNotFound());
      })
      .andThen((_userToken) =>
        createUserToken(_userToken).mapErr((e) => new ValidationError(e)),
      );
  };
