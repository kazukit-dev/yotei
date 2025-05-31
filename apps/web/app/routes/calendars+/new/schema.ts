import { z } from "zod";

export const calendarCreateSchema = z.object({
  name: z.string().min(1, "Name is required").max(256, "Name is too long"),
});

export type CalendarCreateSchema = z.infer<typeof calendarCreateSchema>;
