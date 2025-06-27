import { Context } from "hono";
import { deleteCookie, getSignedCookie, setSignedCookie } from "hono/cookie";

import {
  AuthenticatedEnv,
  COOKIE_DOMAIN,
  COOKIE_SECRET,
  NODE_ENV,
} from "../../../env";

const SESSION_KEY = "session_id";

export const getSession = async (c: Context): Promise<string | null> => {
  const secret = COOKIE_SECRET;
  const value = await getSignedCookie(c, secret, SESSION_KEY);
  return value ? value : null;
};

export const setSession = async (
  c: Context<AuthenticatedEnv>,
  value: string,
  maxAge: number,
) => {
  const secret = COOKIE_SECRET;
  const env = NODE_ENV;
  const domain = COOKIE_DOMAIN;
  await setSignedCookie(c, SESSION_KEY, value, secret, {
    domain: env === "production" ? domain : undefined,
    secure: env === "production",
    httpOnly: true,
    sameSite: "lax",
    maxAge,
  });
};

export const clearSession = (c: Context) => {
  deleteCookie(c, SESSION_KEY);
};
