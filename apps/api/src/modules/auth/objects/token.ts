import { createHash, randomUUID } from "crypto";
import { Ok, ok, okAsync, ResultAsync } from "neverthrow";

import { Brand } from "../../../shared/helpers/brand";
import { signJwt, verifyJwt } from "../libs/jwt";

export type AccessToken = Brand<string, "AccessToken">;

export type RefreshToken = Brand<string, "RefreshToken">;

export type HashedRefreshToken = Brand<string, "HashedRefreshToken">;

type Payload = {
  userId: string;
};

export const generateAccessToken = (secret: string) => (payload: Payload) => {
  return ResultAsync.fromSafePromise(
    signJwt(secret)(payload, "15m") as Promise<AccessToken>,
  );
};

export const generateRefreshToken = (): ResultAsync<RefreshToken, never> => {
  return okAsync(randomUUID() as RefreshToken);
};

export const verifyAccessToken =
  (accessTokenSecret: string) =>
  (token: string): ResultAsync<Payload, string> => {
    return ResultAsync.fromPromise(
      verifyJwt<Payload>(accessTokenSecret)(token),
      () => "Invalid access token",
    ).andThen((decoded) => okAsync({ userId: decoded.payload.userId }));
  };

export const hashRefreshToken = (
  refreshToken: RefreshToken,
): Ok<HashedRefreshToken, never> => {
  const hash = createHash("sha256");
  hash.update(refreshToken);
  return ok(hash.digest("hex") as HashedRefreshToken);
};

export const createRefreshToken = (token: string): Ok<RefreshToken, never> => {
  return ok(token as RefreshToken);
};

export const createHashedRefreshToken = (
  token: string,
): Ok<HashedRefreshToken, never> => {
  return ok(token as HashedRefreshToken);
};
