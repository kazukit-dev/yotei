import dayjs from "../../../../shared/helpers/dayjs";
import { Exception } from "./exception";
import { getRecurringDates, RRule } from "./rrule";

interface _Event {
  id: string;
  calendar_id: string;
  title: string;
  start: Date;
  end: Date;
  duration: number;
  is_recurring: boolean;
  is_all_day: boolean;
  version: number;
}

interface SingleEvent extends _Event {
  is_recurring: false;
}

interface RecurringEvent extends _Event {
  is_recurring: true;
  rrule: RRule;
  exceptions: Exception[];
}

export type Event = SingleEvent | RecurringEvent;

type RawEvent = {
  id: string;
  title: string;
  start: string;
  end: string;
  calendar_id: string;
  duration: number;
  is_recurring: boolean;
  is_all_day: boolean;
  version: number;
  rrule: {
    until: string;
    freq: number;
    dtstart: string;
  } | null;
  exceptions: {
    target_date: string;
    type: string;
  }[];
};

export const toEventModel = (model: RawEvent): Event => {
  const start = new Date(model.start);
  const end = new Date(model.end);
  if (!model.is_recurring) {
    const { exceptions: _, rrule: _2, ...rest } = model;
    return {
      ...rest,
      is_recurring: false,
      start,
      end,
    } as SingleEvent;
  }

  const exceptions = model.exceptions.map((ex) => ({
    ...ex,
    target_date: new Date(ex.target_date),
  }));
  const rrule = {
    freq: model.rrule!.freq,
    until: new Date(model.rrule!.until),
    dtstart: new Date(model.rrule!.dtstart),
  };

  return {
    ...model,
    start,
    end,
    exceptions,
    rrule,
    is_recurring: true,
  } as RecurringEvent;
};

export interface Occurrence {
  id: string;
  start: Date;
  end: Date;
  title: string;
  is_all_day: boolean;
}

export const getOccurrences =
  (range: { from: Date; to: Date }) =>
  (event: Event): Occurrence[] => {
    if (!event.is_recurring) {
      return [
        {
          id: event.id,
          start: event.start,
          end: event.end,
          title: event.title,
          is_all_day: event.is_all_day,
        },
      ];
    }

    const exHash = event.exceptions.reduce((prev, curr) => {
      const exHashKey = curr.target_date.getTime();
      prev.set(exHashKey, true);
      return prev;
    }, new Map<number, true>());

    const getDates = getRecurringDates(event.rrule);
    const occurrences = getDates(range)
      .filter((date) => !exHash.has(date.getTime()))
      .map((date) => {
        const start = date;
        const end = dayjs(start).add(event.duration).toDate();

        return {
          id: event.id,
          start,
          end,
          is_all_day: event.is_all_day,
          title: event.title,
        } satisfies Occurrence;
      });

    return occurrences;
  };
