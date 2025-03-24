import { z } from "zod";

import { compare } from "~/utils/day";

export const titleSchema = z.string().min(1);

export const timeSchema = z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
  message: "Invalid time.",
});

export const dateTimeSchema = z.object({
  date: z.string().date(),
  time: timeSchema.optional(),
});
export const checkboxSchema = z.preprocess(
  (value) => typeof value === "string" && value === "on",
  z.boolean(),
);

export type DateTime = z.infer<typeof dateTimeSchema>;

export const getDate = (d: DateTime, isAllDay: boolean) => {
  return isAllDay ? new Date(d.date) : new Date(`${d.date}T${d.time}`);
};

export const validateDateRange = (
  start: DateTime,
  end: DateTime,
  isAllDay: boolean,
): boolean => {
  const startDate = getDate(start, isAllDay);
  const endDate = getDate(end, isAllDay);
  const operator = isAllDay ? "<=" : "<";
  return compare(startDate, operator, endDate);
};
