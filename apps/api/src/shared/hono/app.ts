import { Hono } from "hono";
import { BlankSchema } from "hono/types";

import { AuthenticatedEnv, Env } from "./env";

export const createApp = <Path extends string>(): Hono<
  Env,
  BlankSchema,
  Path
> => {
  const app = new Hono<Env, BlankSchema, Path>();
  return app;
};

export const createAuthenticatedApp = <Path extends string>(): Hono<
  AuthenticatedEnv,
  BlankSchema,
  Path
> => {
  const app = new Hono<AuthenticatedEnv, BlankSchema, Path>();
  return app;
};
