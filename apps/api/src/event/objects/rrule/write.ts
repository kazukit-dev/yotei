import dayjs from "dayjs";
import { Result, err, ok } from "neverthrow";
import type { Brand } from "../../../helpers/brand";
import { compare } from "../../../helpers/date";

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
export const Frequency = {
  create: (value: number): Result<Frequency, "InvalidFrequency"> => {
    switch (value) {
      case FREQUENCIES.YEARLY:
      case FREQUENCIES.MONTHLY:
      case FREQUENCIES.WEEKLY:
      case FREQUENCIES.DAILY:
        return ok(value as Frequency);
      default:
        return err("InvalidFrequency");
    }
  },
} as const;

export type Dtstart = Brand<Date, "Dtstart">;
export const Dtstart = {
  create: (
    value: string | number | Date,
  ): Result<Dtstart, "InvalidRRuleDtstart"> => {
    return dayjs(value).isValid()
      ? ok(new Date(value) as Dtstart)
      : err("InvalidRRuleDtstart");
  },
};

export type Until = Brand<Date, "Until">;
export const Until = {
  create: (
    value: string | number | Date,
  ): Result<Until, "InvalidRRuleUntil"> => {
    return value && dayjs(value).isValid()
      ? ok(new Date(value) as Until)
      : err("InvalidRRuleUntil");
  },
};

export type RRule = Brand<
  {
    freq: Frequency;
    dtstart: Dtstart;
    until: Until;
  },
  "RRule"
>;

export type UnvalidatedRRule = {
  freq: number;
  dtstart: string | number | Date;
  until: string | number | Date;
};

export const RRule = {
  create: (input: UnvalidatedRRule): Result<RRule, string> => {
    if (!compare(new Date(input.dtstart), "<", new Date(input.until))) {
      return err("InvalidRRuleUntil");
    }

    const freq = Frequency.create(input.freq);
    const dtstart = Dtstart.create(input.dtstart);
    const until = Until.create(input.until);

    return Result.combine([freq, dtstart, until]).map(
      ([freq, dtstart, until]) => {
        return {
          freq,
          dtstart,
          until,
        } as RRule;
      },
    );
  },
};
