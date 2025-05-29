import { err, ok, Result, ResultAsync } from "neverthrow";
import {
  createOauth2Code,
  createOauth2CodeVerifier,
  Oauth2Code,
  Oauth2CodeVerifier,
} from "../objects/oidc";
import { AuthError, DBError, ValidationError } from "../../../shared/errors";
import { tuple } from "../../../shared/helpers/tuple";
import {
  createEmail,
  generateUserId,
  createUserName,
  Email,
  User,
} from "../objects/user";
import {
  Session,
  generateSessionExpiresAt,
  generateSessionId,
  generateSessionMaxAge,
  SessionMaxAge,
} from "../objects/session";
import {
  Account,
  AccountId,
  createAccountId,
  createProviderId,
  ProviderId,
} from "../objects/account";

class TokenExchangeError extends AuthError {}
class TokenVerifyError extends AuthError {}

type WorkflowError =
  | TokenExchangeError
  | TokenVerifyError
  | ValidationError
  | DBError;

type Oauth2Tokens = {
  accessToken: string;
  refreshToken: string;
  idToken: string;
  expiresIn: number;
};

type UserInfo = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
};

type ExchangeCodeForToken = (
  Oauth2Code: Oauth2Code,
  codeVerifier: Oauth2CodeVerifier,
) => ResultAsync<Oauth2Tokens, Error>;

type VerifyIdToken = (
  token: string,
  params: {
    audience: string;
    expirationTime: number;
    nonce?: string;
  },
) => ResultAsync<void, Error>;

type GetUserInfo = (tokens: {
  idToken: string;
  accessToken: string;
  refreshToken: string;
}) => ResultAsync<UserInfo, Error>;

export interface Provider {
  providerId: string;
  exchangeCodeForToken: ExchangeCodeForToken;
  verifyIdToken: VerifyIdToken;
  getUserInfo: GetUserInfo;
}

type UnvalidatedCommand = {
  kind: "unvalidated";
  input: {
    code: string;
    code_verifier: string;
  };
};

type ValidatedCommand = {
  kind: "validated";
  input: {
    code: Oauth2Code;
    code_verifier: Oauth2CodeVerifier;
  };
};

type TokenExchanged = {
  kind: "exchanged";
  token: Oauth2Tokens;
};

type TokenVerified = {
  kind: "verified";
  token: Oauth2Tokens;
  userInfo: Omit<UserInfo, "emailVerified">;
};

type AccountCreated = {
  kind: "account_created";
  user: User;
  account: Account;
};

type AccountLinked = {
  kind: "linked";
  user: User;
};

type SessionIssued = {
  kind: "session_issued";
  session: Session & { max_age: SessionMaxAge };
};

type Validate = (
  input: UnvalidatedCommand,
) => Result<ValidatedCommand, ValidationError>;

type ExchangeToken = (
  exchangeCodeForToken: ExchangeCodeForToken,
) => (
  command: ValidatedCommand,
) => ResultAsync<TokenExchanged, TokenExchangeError>;

type VerifyToken = (
  clientId: string,
  provider: Provider,
) => (command: TokenExchanged) => ResultAsync<TokenVerified, TokenVerifyError>;

type CreateAccount = (
  providerId: string,
) => (command: TokenVerified) => Result<AccountCreated, ValidationError>;

type FindOauth2User = (
  providerId: ProviderId,
  accountId: AccountId,
  email: Email,
) => ResultAsync<
  { user: User; account: Account } | null,
  DBError | ValidationError
>;
type SaveOauthUser = (
  user: User,
  account: Account,
) => ResultAsync<void, DBError>;

type LinkAccount = (
  findOauth2User: FindOauth2User,
  saveOauthUser: SaveOauthUser,
) => (
  command: AccountCreated,
) => ResultAsync<AccountLinked, DBError | ValidationError>;

type IssueSession = (command: AccountLinked) => Result<SessionIssued, never>;

type SigninWorkflow = (
  clientId: string,
  provider: Provider,
  findOauthUser: FindOauth2User,
  saveOauthUser: SaveOauthUser,
) => (command: UnvalidatedCommand) => ResultAsync<SessionIssued, WorkflowError>;

const validate: Validate = (command) => {
  const code = createOauth2Code(command.input.code);
  const codeVerifier = createOauth2CodeVerifier(command.input.code_verifier);

  const values = tuple(code, codeVerifier);

  return Result.combineWithAllErrors(values)
    .map(
      ([code, codeVerifier]) =>
        ({
          kind: "validated",
          input: {
            code,
            code_verifier: codeVerifier,
          },
        }) as const,
    )
    .mapErr((errors) => new ValidationError(errors));
};

const exchangeToken: ExchangeToken = (getTokens) => (command) => {
  return getTokens(command.input.code, command.input.code_verifier)
    .map((tokens) => {
      return {
        kind: "exchanged",
        token: tokens,
      } as const;
    })
    .mapErr(
      (error) =>
        new TokenExchangeError("Failed to get credentials", { cause: error }),
    );
};

const verifyToken: VerifyToken = (clientId, provider) => (command) => {
  const verifyIdToken = (command: TokenExchanged) => {
    return ok(command.token.idToken)
      .asyncAndThrough((idToken) =>
        provider.verifyIdToken(idToken, {
          audience: clientId,
          expirationTime: command.token.expiresIn,
        }),
      )
      .mapErr(
        (err) =>
          new TokenVerifyError(
            "An error occurred while verifying the idToken",
            {
              cause: err,
            },
          ),
      );
  };
  const getUserInfo = (command: TokenExchanged) => {
    return ok(command.token)
      .asyncAndThen(provider.getUserInfo)
      .andThen(({ emailVerified, ...userInfo }) => {
        if (!emailVerified) {
          return err(
            new TokenVerifyError("Email is not verified by the provider"),
          );
        }
        return ok({
          ...command,
          kind: "verified",
          userInfo,
        } as const);
      });
  };
  return ok(command).asyncAndThrough(verifyIdToken).andThen(getUserInfo);
};

const createAccount: CreateAccount =
  (providerId) =>
  ({ userInfo }) => {
    const accountId = createAccountId(userInfo.id);
    const name = createUserName(userInfo.name);
    const email = createEmail(userInfo.email);
    const _provider = createProviderId(providerId);

    const values = tuple(accountId, name, email, _provider);
    return Result.combineWithAllErrors(values)
      .map(([accountId, name, email, provider]) => {
        const user = {
          id: generateUserId(),
          name,
          email,
        };
        const account = {
          account_id: accountId,
          user_id: user.id,
          provider_id: provider,
        };
        return {
          kind: "account_created",
          user,
          account,
        } as const;
      })
      .mapErr((errors) => new ValidationError(errors));
  };

const linkAccount: LinkAccount =
  (findOauth2User, saveOauthUser) =>
  ({ user, account }) => {
    const { provider_id: providerId, account_id: accountId } = account;
    const { email } = user;

    return findOauth2User(providerId, accountId, email).andThen((dbUser) => {
      if (dbUser) {
        return ok({
          kind: "linked",
          user: dbUser.user,
        } as const);
      }

      return saveOauthUser(user, account).andThen(() => {
        return ok({
          kind: "linked",
          user,
        } as const);
      });
    });
  };

const issueSession: IssueSession = (command) => {
  const session = {
    id: generateSessionId(),
    user_id: command.user.id,
    expires_at: generateSessionExpiresAt(),
    max_age: generateSessionMaxAge(),
  } as const;
  return ok({
    ...command,
    kind: "session_issued",
    session,
  } as const);
};

export const toUnvalidatedSigninCommand = (input: {
  code: string;
  code_verifier: string;
}): UnvalidatedCommand => {
  return {
    kind: "unvalidated",
    input,
  } as const;
};

export const signinWorkflow: SigninWorkflow =
  (clientId, provider, findOauthUser, saveOauthUser) => (command) => {
    return ok(command)
      .andThen(validate)
      .asyncAndThen(exchangeToken(provider.exchangeCodeForToken))
      .andThen(verifyToken(clientId, provider))
      .andThen(createAccount(provider.providerId))
      .andThen(linkAccount(findOauthUser, saveOauthUser))
      .andThen(issueSession);
  };
