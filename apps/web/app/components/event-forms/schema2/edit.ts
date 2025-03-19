import { z } from "zod";
import {
  checkboxSchema,
  dateTimeSchema,
  getDate,
  titleSchema,
  validateDateRange,
} from "./common";

export const eventEditFormSchema = z
  .object({
    title: titleSchema,
    start: dateTimeSchema,
    end: dateTimeSchema,
    is_all_day: checkboxSchema,
  })
  .refine(
    ({ start, end, is_all_day }) => validateDateRange(start, end, is_all_day),
    {
      message: "Invalid date range",
      path: ["start"],
    },
  )
  .transform((args) => {
    const start = getDate(args.start, args.is_all_day).toISOString();
    const end = getDate(args.end, args.is_all_day).toISOString();

    return {
      ...args,
      start,
      end,
    };
  });

export type EventEditFormSchema = z.input<typeof eventEditFormSchema>;
export type ValidatedEventEditSchema = z.output<typeof eventEditFormSchema>;
