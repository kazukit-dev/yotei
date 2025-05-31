import { Context } from "hono";
import { deleteCookie, getSignedCookie, setSignedCookie } from "hono/cookie";

import { AuthenticatedEnv } from "../../../env";

const SESSION_KEY = "session_id";

export const getSession = async (c: Context): Promise<string | null> => {
  const secret = c.env.COOKIE_SECRET;
  const value = await getSignedCookie(c, secret, SESSION_KEY);
  return value ? value : null;
};

export const setSession = async (
  c: Context<AuthenticatedEnv>,
  value: string,
  maxAge: number,
) => {
  const secret = c.env.COOKIE_SECRET;
  const env = c.env.NODE_ENV;
  const domain = c.env.COOKIE_DOMAIN;
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
