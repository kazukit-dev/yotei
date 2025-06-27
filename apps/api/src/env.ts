import { z } from "zod";

import { DB } from "./db";

const envSchema = z.object({
  NODE_ENV: z.enum(["develop", "production"]),
  // cors
  CORS_ORIGIN: z.string().min(1),
  // database
  DATABASE_URL: z.string().min(1),
  // OIDC
  OAUTH2_URL: z.string().min(1),
  OAUTH2_REDIRECT_URI: z.string().min(1),
  OAUTH2_CLIENT_ID: z.string().min(1),
  OAUTH2_CLIENT_SECRET: z.string().min(1),
  // cookie
  COOKIE_DOMAIN: z.string().min(1),
  COOKIE_SECRET: z.string().min(1),
  // port
  PORT: z.coerce.number().default(8787),
});

const env = envSchema.parse(process.env);

type Bindings = z.infer<typeof envSchema>;

export type Env = {
  Bindings: Bindings;
  Variables: {
    db: DB;
  };
};

export type AuthenticatedEnv = {
  Bindings: Bindings;
  Variables: {
    userId: string;
    db: DB;
  };
};

export const {
  NODE_ENV,
  COOKIE_DOMAIN,
  COOKIE_SECRET,
  CORS_ORIGIN,
  PORT,
  OAUTH2_CLIENT_ID,
  OAUTH2_CLIENT_SECRET,
  OAUTH2_REDIRECT_URI,
  OAUTH2_URL,
  DATABASE_URL,
} = env;
