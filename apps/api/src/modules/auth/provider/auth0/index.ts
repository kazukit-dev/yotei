import * as jose from "jose";
import { err, ok, okAsync, ResultAsync } from "neverthrow";
import { z } from "zod";

import { Provider } from "../../workflows/signin";

type Oauth2Context = {
  baseUrl: string | URL;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
};

const oauth2TokensSchema = z.object({
  access_token: z.string().min(1),
  refresh_token: z.string().min(1),
  id_token: z.string().min(1),
  expires_in: z.number().int().positive(),
});

const userInfoSchema = z.object({
  sub: z.string().min(1),
  name: z.string().min(1),
  email: z.string().email(),
  email_verified: z.boolean(),
});

export const createAuth0Provider = (ctx: Oauth2Context): Provider => {
  const tokenUrl = new URL("/oauth/token", ctx.baseUrl);
  const jwksUrl = new URL("/.well-known/jwks.json", ctx.baseUrl);
  return {
    providerId: "auth0",
    exchangeCodeForToken: (code, codeVerifier) => {
      const data = new URLSearchParams({
        code,
        code_verifier: codeVerifier,
        client_id: ctx.clientId,
        client_secret: ctx.clientSecret,
        redirect_uri: ctx.redirectUri,
        grant_type: "authorization_code",
      });

      const request = new Request(tokenUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: data,
      });

      return ResultAsync.fromPromise(
        fetch(request).then((res) => {
          if (!res.ok) {
            throw new Error("Failed to fetch oauth2 token");
          }
          return res.json();
        }),
        (err) => {
          return new Error("Failed to fetch oauth2 token", { cause: err });
        },
      ).andThen((data) => {
        const parsed = oauth2TokensSchema.safeParse(data);
        if (!parsed.success) {
          return err(new Error("Invalid oauth2 token response"));
        }
        return ok({
          accessToken: parsed.data.access_token,
          refreshToken: parsed.data.refresh_token,
          idToken: parsed.data.id_token,
          expiresIn: parsed.data.expires_in,
        });
      });
    },

    verifyIdToken: (token, params) => {
      const JWKS = jose.createRemoteJWKSet(new URL(jwksUrl));

      return ResultAsync.fromPromise(
        jose.jwtVerify(token, JWKS, {
          audience: params.audience,
          clockTolerance: params.expirationTime,
        }),
        (error) => new Error(`Failed to verify JWT`, { cause: error }),
      ).map(() => {});
    },

    getUserInfo: (tokens: {
      idToken: string;
      accessToken: string;
      refreshToken: string;
    }) => {
      const decoded = jose.decodeJwt(tokens.idToken);
      // decodedでnameなどがない場合は/userinfoエンドポイントを叩く必要がある
      return okAsync(decoded).andThen((data) => {
        const parsed = userInfoSchema.safeParse(data);
        if (!parsed.success) {
          return err(new Error("Invalid user info in ID token"));
        }
        return ok({
          id: parsed.data.sub,
          name: parsed.data.name,
          email: parsed.data.email,
          emailVerified: parsed.data.email_verified,
        });
      });
    },
  } as const;
};
