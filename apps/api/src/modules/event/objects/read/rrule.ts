import { RRule as _RRule } from "rrule";

export type RRule = {
  freq: number;
  until: Date;
  dtstart: Date;
};

export const getRecurringDates =
  (rrule: RRule) => (range: { from: Date; to: Date }) => {
    const rule = new _RRule({
      freq: rrule.freq,
      dtstart: rrule.dtstart,
      until: rrule.until,
    });
    return rule.between(range.from, range.to, true);
  };
