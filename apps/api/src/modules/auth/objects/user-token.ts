import dayjs from "dayjs";
import { Ok, ok, Result } from "neverthrow";

import { Brand } from "../../../shared/helpers/brand";
import { createUserId, UserId } from "./id";
import { createHashedRefreshToken, HashedRefreshToken } from "./token";

export type TokenExpiresAt = Brand<Date, "TokenExpiresAt">;

export type UserToken = {
  userId: UserId;
  token: HashedRefreshToken;
  expiresAt: TokenExpiresAt;
};

export const generateExpiresAt = (): Ok<TokenExpiresAt, never> => {
  const expiresAt = dayjs().add(30, "m").toDate();
  return ok(expiresAt as TokenExpiresAt);
};

export const createExpiresAt = (date: Date): Ok<TokenExpiresAt, never> => {
  return ok(date as TokenExpiresAt);
};

export const createUserToken = (userToken: {
  userId: string;
  token: string;
  expiresAt: Date;
}): Result<UserToken, string[]> => {
  const userId = createUserId(userToken.userId);
  const token = createHashedRefreshToken(userToken.token);
  const expiresAt = createExpiresAt(userToken.expiresAt);

  return Result.combineWithAllErrors([userId, token, expiresAt]).map(
    ([userId, token, expiresAt]) => {
      return {
        userId,
        token,
        expiresAt,
      } as const;
    },
  );
};
