import { z } from "zod";

export const signinSchema = z.object({
  code: z.string().min(1),
  code_verifier: z.string().min(1),
});
export type SigninSchema = z.infer<typeof signinSchema>;
