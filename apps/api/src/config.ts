import { z } from "zod";

const envSchema = z.object({
  CORS_ORIGIN: z.string().min(1),
  DATABASE_URL: z.string().min(1),
  ACCESS_TOKEN_SECRET: z.string().min(1),
  REFRESH_TOKEN_SECRET: z.string().min(1),
  OAUTH2_URL: z.string().min(1),
  OAUTH2_REDIRECT_URI: z.string().min(1),
  OAUTH2_CLIENT_ID: z.string().min(1),
  OAUTH2_CLIENT_SECRET: z.string().min(1),
});

const env = envSchema.parse(process.env);

export const CORS_ORIGIN = env.CORS_ORIGIN;
