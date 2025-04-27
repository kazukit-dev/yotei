import { z } from "zod";

export const createCalendarSchema = z.object({
  name: z.string().min(1, "Name is required").max(256, "Name is too long"),
});
