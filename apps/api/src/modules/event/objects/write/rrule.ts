import dayjs from "dayjs";
import { err, ok, Result } from "neverthrow";

import type { Brand } from "../../../../shared/helpers/brand";
import { compare } from "../../../../shared/helpers/date";

const FREQUENCIES = {
  YEARLY: 0,
  MONTHLY: 1,
  WEEKLY: 2,
  DAILY: 3,
} as const;

export type Frequency = Brand<
  (typeof FREQUENCIES)[keyof typeof FREQUENCIES],
  "Frequency"
>;

export type Dtstart = Brand<Date, "Dtstart">;

export type Until = Brand<Date, "Until">;

export type RRule = {
  freq: Frequency;
  dtstart: Dtstart;
  until: Until;
};

export const createFrequency = (
  value: number,
): Result<Frequency, "InvalidFrequency"> => {
  switch (value) {
    case FREQUENCIES.YEARLY:
    case FREQUENCIES.MONTHLY:
    case FREQUENCIES.WEEKLY:
    case FREQUENCIES.DAILY:
      return ok(value as Frequency);
    default:
      return err("InvalidFrequency");
  }
};

export const createDtstart = (
  value: string | number | Date,
): Result<Dtstart, "InvalidRRuleDtstart"> => {
  return dayjs(value).isValid()
    ? ok(new Date(value) as Dtstart)
    : err("InvalidRRuleDtstart");
};

export const createUntil = (
  value: string | number | Date,
): Result<Until, "InvalidRRuleUntil"> => {
  return value && dayjs(value).isValid()
    ? ok(new Date(value) as Until)
    : err("InvalidRRuleUntil");
};

export type UnvalidatedRRule = {
  freq: number;
  dtstart: string | number | Date;
  until: string | number | Date;
};

export const createRRule = (input: UnvalidatedRRule): Result<RRule, string> => {
  if (!compare(new Date(input.dtstart), "<", new Date(input.until))) {
    return err("InvalidRRuleUntil");
  }

  const freq = createFrequency(input.freq);
  const dtstart = createDtstart(input.dtstart);
  const until = createUntil(input.until);

  return Result.combine([freq, dtstart, until]).map(
    ([freq, dtstart, until]) => {
      return {
        freq,
        dtstart,
        until,
      } as RRule;
    },
  );
};
