import { Context } from "hono";
import { deleteCookie, getSignedCookie, setSignedCookie } from "hono/cookie";

const SESSION_KEY = "session_id";

export const getSession = async (c: Context): Promise<string | null> => {
  const secret = c.env.COOKIE_SECRET;
  const value = await getSignedCookie(c, secret, SESSION_KEY, "secure");
  return value ? value : null;
};

export const setSession = async (c: Context, value: string, maxAge: number) => {
  const secret = c.env.COOKIE_SECRET;
  const domain = c.env.COOKIE_DOMAIN;
  await setSignedCookie(c, SESSION_KEY, value, secret, {
    domain,
    secure: true,
    httpOnly: true,
    sameSite: "lax",
    maxAge,
  });
};

export const clearSession = (c: Context) => {
  deleteCookie(c, SESSION_KEY);
};
