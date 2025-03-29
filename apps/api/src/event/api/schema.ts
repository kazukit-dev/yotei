import { z } from "zod";

export const createEventSchema = z.object({
  title: z.string(),
  start: z.string().datetime().or(z.string().date()),
  end: z.string().datetime().or(z.string().date()),
  is_recurring: z.boolean(),
  is_all_day: z.boolean(),
  rrule: z
    .object({
      freq: z.number(),
      until: z.string().datetime(),
    })
    .optional(),
});

export const getEventsSchema = z.object({
  from: z.string().date(),
  to: z.string().date(),
});

export const updateEventSchema = z.object({
  title: z.string(),
  start: z.string().date().or(z.string().datetime()),
  end: z.string().date().or(z.string().datetime()),
  target_date: z.string().date().or(z.string().datetime()),
  is_all_day: z.boolean(),
  pattern: z.number(),
});

export const getEventDetailSchema = z.object({
  target_date: z.string().datetime().or(z.string().date()),
});

export const deleteEventSchema = z.object({
  pattern: z.number(),
  target_date: z.string().date().or(z.string().datetime()),
});
