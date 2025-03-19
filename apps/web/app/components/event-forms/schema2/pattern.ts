import { z } from "zod";

export const patternSchema = z.object({
  pattern: z.enum(["0", "1", "2"]),
});

export type PatternSchema = z.infer<typeof patternSchema>;
