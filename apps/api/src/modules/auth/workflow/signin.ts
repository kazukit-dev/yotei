import { err, ok, okAsync, Result, ResultAsync } from "neverthrow";

import { verifyPassword } from "../objects/password";
import {
  AccessToken,
  generateAccessToken,
  generateRefreshToken,
  hashRefreshToken,
  RefreshToken,
} from "../objects/token";
import { User } from "../objects/user";
import { generateExpiresAt, UserToken } from "../objects/user-token";

class UserVerificationError extends Error {}

type WorkflowError = UserVerificationError;

type CreatedUserToken = UserToken & { kind: "created" };

type UnvalidatedCommand = {
  kind: "unverified";
  user: User;
  input: {
    password: string;
  };
};

type UserVerified = {
  kind: "verified";
  user: User;
};

type TokenGenerated = {
  kind: "token_generated";
  user: User;
  tokens: {
    access_token: AccessToken;
    refresh_token: RefreshToken;
  };
};

type UserTokenCreated = {
  kind: "user_token_created";
  tokens: {
    access_token: AccessToken;
    refresh_token: RefreshToken;
  };
  userToken: CreatedUserToken;
};

type VerifyUser = (
  command: UnvalidatedCommand,
) => Result<UserVerified, UserVerificationError>;

type GenerateToken = (
  command: UserVerified,
) => ResultAsync<TokenGenerated, never>;

type CreateUserToken = (
  command: TokenGenerated,
) => ResultAsync<UserTokenCreated, never>;

type Workflow = (
  command: UnvalidatedCommand,
) => ResultAsync<UserTokenCreated, WorkflowError>;

const verifyUser: VerifyUser = ({ user, input }) => {
  const isValid = verifyPassword(input.password, user.hashed_password);
  if (!isValid) return err(new UserVerificationError("Invalid password"));

  return ok({
    kind: "verified",
    user,
  });
};

const generateToken =
  (accessTokenSecret: string): GenerateToken =>
  ({ user }) => {
    const payload = {
      userId: user.id,
    };
    const genAccessToken = generateAccessToken(accessTokenSecret);
    const refreshToken = generateRefreshToken();

    return ResultAsync.combine([genAccessToken(payload), refreshToken]).map(
      ([accessToken, refreshToken]) => {
        return {
          kind: "token_generated",
          user,
          tokens: {
            access_token: accessToken,
            refresh_token: refreshToken,
          },
        };
      },
    );
  };

const createUserToken: CreateUserToken = ({ tokens, user }) => {
  const token = ok(tokens.refresh_token).andThen(hashRefreshToken);
  const expiresAt = generateExpiresAt();

  return Result.combine([token, expiresAt])
    .map(([token, expiresAt]) => {
      return {
        kind: "created",
        userId: user.id,
        token,
        expiresAt,
      } as const;
    })
    .asyncAndThen((userToken) => {
      return okAsync({
        kind: "user_token_created",
        tokens,
        userToken,
      } as const);
    });
};

export const toUnvalidatedSigninCommand = (
  user: User,
  password: string,
): UnvalidatedCommand => {
  return { user, input: { password }, kind: "unverified" } as const;
};

export const signinWorkflow =
  (accessTokenSecret: string): Workflow =>
  (command) => {
    return ok(command)
      .andThen(verifyUser)
      .asyncAndThen(generateToken(accessTokenSecret))
      .andThen(createUserToken);
  };
