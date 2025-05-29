import { err, ok, Ok, Result } from "neverthrow";
import { Brand } from "../../../../shared/helpers/brand";

export type Oauth2Code = Brand<string, "Oauth2Code">;
export type Oauth2CodeVerifier = Brand<string, "Oauth2CodeVerifier">;

export const createOauth2Code = (
  code: string,
): Result<Oauth2Code, "InvalidOauth2Code"> => {
  if (code.length <= 0) return err("InvalidOauth2Code");
  return ok(code as Oauth2Code);
};

const MIN_CODE_VERIFIER_LENGTH = 43;
const MAX_CODE_VERIFIER_LENGTH = 128;

export const createOauth2CodeVerifier = (
  codeVerifier: string,
): Result<Oauth2CodeVerifier, "InvalidOauth2CodeVerifier"> => {
  if (
    codeVerifier.length < MIN_CODE_VERIFIER_LENGTH ||
    codeVerifier.length > MAX_CODE_VERIFIER_LENGTH
  ) {
    return err("InvalidOauth2CodeVerifier");
  }
  return ok(codeVerifier as Oauth2CodeVerifier);
};
