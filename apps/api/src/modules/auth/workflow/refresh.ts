import dayjs from "dayjs";
import { err, Ok, ok, okAsync, Result, ResultAsync } from "neverthrow";

import { UserId } from "../objects/id";
import {
  AccessToken,
  generateAccessToken,
  generateRefreshToken,
  HashedRefreshToken,
  hashRefreshToken,
  RefreshToken,
} from "../objects/token";
import { generateExpiresAt, UserToken } from "../objects/user-token";

class TokenVerificationError extends Error {}

type WorkflowError = TokenVerificationError;

type CreatedUserToken = {
  kind: "created";
} & UserToken;

type RevokedToken = {
  kind: "revoked";
  token: HashedRefreshToken;
};

type UnverifiedUserToken = {
  kind: "token_unverified";
  userToken: UserToken;
};

type VerifiedUserToken = {
  kind: "token_verified";
  userToken: UserToken;
};

type TokenRevoked = {
  kind: "token_revoked";
  userId: UserId;
  revokedToken: RevokedToken;
};

type TokenGenerated = {
  kind: "token_generated";
  userId: UserId;
  revokedToken: RevokedToken;
  tokens: {
    access_token: AccessToken;
    refresh_token: RefreshToken;
  };
};

type UserTokenCreated = {
  kind: "user_token_created";
  revokedToken: RevokedToken;
  tokens: {
    access_token: AccessToken;
    refresh_token: RefreshToken;
  };
  createdUserToken: CreatedUserToken;
};

type VerifyToken = (
  command: UnverifiedUserToken,
) => Result<VerifiedUserToken, TokenVerificationError>;

type RevokeToken = (command: VerifiedUserToken) => Ok<TokenRevoked, never>;

type GenerateToken = (
  command: TokenRevoked,
) => ResultAsync<TokenGenerated, never>;

type CreateUserToken = (
  command: TokenGenerated,
) => ResultAsync<UserTokenCreated, never>;

type Workflow = (
  command: UnverifiedUserToken,
) => ResultAsync<UserTokenCreated, WorkflowError>;

const verifyToken: VerifyToken = ({ userToken }) => {
  // refresh_tokenの期限が切れていたらエラー
  // このレコードはバッチで削除する?
  if (dayjs(userToken.expiresAt).isSameOrBefore(dayjs())) {
    return err(new TokenVerificationError("Refresh token expired"));
  }

  return ok({
    kind: "token_verified",
    userToken,
  } as const);
};

const revokeToken: RevokeToken = ({ userToken }) => {
  return ok({
    kind: "token_revoked",
    userId: userToken.userId,
    revokedToken: {
      kind: "revoked",
      token: userToken.token,
    },
  } as const);
};

const generateTokens =
  (accessTokenSecret: string): GenerateToken =>
  ({ userId, ...command }) => {
    const accessToken = generateAccessToken(accessTokenSecret)({
      userId,
    });
    const refreshToken = generateRefreshToken();

    return ResultAsync.combine([accessToken, refreshToken]).map(
      ([accessToken, refreshToken]) => {
        return {
          ...command,
          kind: "token_generated",
          userId,
          tokens: {
            access_token: accessToken,
            refresh_token: refreshToken,
          },
        } as const;
      },
    );
  };

const createUserToken: CreateUserToken = ({ tokens, userId, ...command }) => {
  const token = ok(tokens.refresh_token).andThen(hashRefreshToken);
  const expiresAt = generateExpiresAt();

  return Result.combine([token, expiresAt])
    .map(([token, expiresAt]) => {
      return {
        kind: "created",
        userId,
        token,
        expiresAt,
      } as const;
    })
    .asyncAndThen((userToken) => {
      return okAsync({
        ...command,
        kind: "user_token_created",
        tokens,
        createdUserToken: userToken,
      } as const);
    });
};

export const toUnverifiedRefreshCommand = (
  userToken: UserToken,
): UnverifiedUserToken => {
  return { userToken, kind: "token_unverified" };
};

export const refreshWorkflow =
  (accessTokenSecret: string): Workflow =>
  (command) => {
    return ok(command)
      .andThen(verifyToken)
      .andThen(revokeToken)
      .asyncAndThen(generateTokens(accessTokenSecret))
      .andThen(createUserToken);
  };
