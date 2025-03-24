import { z } from "zod";

import { compare } from "~/utils/day";

import {
  checkboxSchema,
  dateTimeSchema,
  titleSchema,
  validateDateRange,
} from "./common";

const validateRRuleUntil = (until: string, startDate: string): boolean => {
  return compare(new Date(until), ">", new Date(startDate));
};

const freqSchema = z.enum(["daily", "weekly", "monthly", "yearly"]);

const rruleSchema = z
  .object({
    freq: z.literal("none"),
  })
  .or(
    z.object({
      freq: freqSchema,
      until: z.string(),
    }),
  );

export const eventCreateSchema = z
  .object({
    title: titleSchema,
    start: dateTimeSchema,
    end: dateTimeSchema,
    is_all_day: checkboxSchema,
    rrule: rruleSchema,
  })
  .refine(({ start, end, is_all_day }) =>
    validateDateRange(start, end, is_all_day),
  )
  .refine(({ rrule, start }) => {
    if (rrule.freq === "none") return true;
    return validateRRuleUntil(rrule.until, start.date);
  });

export type EventCreateSchema = z.infer<typeof eventCreateSchema>;
