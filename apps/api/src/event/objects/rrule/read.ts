import * as RRuleLib from "rrule";

export type RRule = {
  freq: number;
  until: Date;
  dtstart: Date;
};

export type UnvalidatedRRule = {
  freq: number;
  until: string;
  dtstart: string;
};

export const RRule = {
  create: (input: UnvalidatedRRule): RRule => {
    return {
      ...input,
      until: new Date(input.until),
      dtstart: new Date(input.dtstart),
    };
  },

  between:
    ({ freq, dtstart, until }: RRule) =>
    (from: Date, to: Date): Date[] => {
      const rrule = new RRuleLib.RRule({
        freq,
        dtstart,
        until,
      });
      const dates = rrule.between(from, to);
      return dates;
    },
} as const;

export const getRecurringDates =
  (from: Date, to: Date) =>
  ({ freq, dtstart, until }: RRule) => {
    const rrule = new RRuleLib.RRule({
      freq,
      dtstart,
      until,
    });
    return rrule.between(from, to, true);
  };
