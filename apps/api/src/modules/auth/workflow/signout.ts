import dayjs from "dayjs";
import { err, ok, Result } from "neverthrow";

import { HashedRefreshToken } from "../objects/token";
import { UserToken } from "../objects/user-token";

class TokenVerificationError extends Error {}

type WorkflowError = TokenVerificationError;

type TokenUnverified = {
  kind: "token_unverified";
  userToken: UserToken;
};

type TokenVerified = {
  kind: "token_verified";
  userToken: UserToken;
};

type TokenRevoked = {
  kind: "revoked";
  token: HashedRefreshToken;
};

type VerifyUserToken = (
  command: TokenUnverified,
) => Result<TokenVerified, TokenVerificationError>;

type RevokeToken = (command: TokenVerified) => Result<TokenRevoked, never>;

type Workflow = (
  command: TokenUnverified,
) => Result<TokenRevoked, WorkflowError>;

const verifyToken: VerifyUserToken = ({ userToken }) => {
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

const revokeToken: RevokeToken = (command) => {
  return ok({ kind: "revoked", token: command.userToken.token });
};

export const toUnverifiedSignoutCommand = (
  userToken: UserToken,
): TokenUnverified => {
  return { kind: "token_unverified", userToken };
};

export const signoutWorkflow = (): Workflow => (command) => {
  return ok(command).andThen(verifyToken).andThen(revokeToken);
};
