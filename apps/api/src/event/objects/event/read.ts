import { Result, err, ok } from "neverthrow";
import dayjs from "../../../helpers/dayjs";
import { Exception, type UnvalidatedException } from "../exception/read";
import { RRule, type UnvalidatedRRule, getRecurringDates } from "../rrule/read";

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

type UnvalidatedEvent = {
  id: string;
  calendar_id: string;
  title: string;
  start: string;
  end: string;
  duration: number;
  is_recurring: boolean;
  is_all_day: boolean;
  exceptions: UnvalidatedException[];
  rrule?: UnvalidatedRRule | null;
  version: number;
};

export const Event = {
  create: (input: UnvalidatedEvent): Result<Event, string> => {
    const start = new Date(input.start);
    const end = new Date(input.end);

    if (!input.is_recurring) {
      const { exceptions, ...model } = input;
      return ok({
        ...model,
        start,
        end,
        is_recurring: false,
      });
    }

    if (!input.rrule) {
      return err("ReadModelError");
    }
    const exceptions = input.exceptions.map(Exception.create);
    const rrule = RRule.create(input.rrule);

    return Result.combine(exceptions).map((exs) => ({
      ...input,
      start,
      end,
      rrule,
      is_recurring: true,
      exceptions: exs,
    }));
  },
} as const;

export interface Occurrence {
  id: string;
  start: Date;
  end: Date;
  title: string;
  is_all_day: boolean;
}

export const getOccurrences =
  (from: Date, to: Date) =>
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

    const occurrences = getRecurringDates(
      from,
      to,
    )(event.rrule)
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
