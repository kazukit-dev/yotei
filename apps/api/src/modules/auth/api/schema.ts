import { z } from "zod";

export const signupSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string(),
});

export const signinSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const refreshSchema = z.object({
  refresh_token: z.string().min(1),
});

export const signoutSchema = z.object({
  refresh_token: z.string().min(1),
});
