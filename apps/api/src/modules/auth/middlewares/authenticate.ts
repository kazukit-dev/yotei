import { MiddlewareHandler } from "hono";
import { ok } from "neverthrow";

import { AuthContext } from "../../../context";
import { Env } from "../../../env";
import { AuthError } from "../../../shared/errors";
import { verifyAccessToken } from "../objects/token";

export const authenticate: MiddlewareHandler<
  Env & { Variables: AuthContext }
> = async (c, next) => {
  const authorization = c.req.header("Authorization");
  if (!authorization) {
    throw new AuthError("Authorization header is missing");
  }
  const [_scheme, token] = authorization.split(" ");
  if (!token) {
    throw new AuthError("Authorization token is missing");
  }

  await ok(token)
    .asyncAndThen(verifyAccessToken(c.env.ACCESS_TOKEN_SECRET))
    .match(
      (payload) => {
        c.set("userId", payload.userId);
        c.set("email", payload.email);
      },
      (err) => {
        throw new AuthError("Invalid access token", { cause: err });
      },
    );

  return await next();
};
