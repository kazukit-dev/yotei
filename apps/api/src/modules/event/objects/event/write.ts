import { err, ok, Result } from "neverthrow";

import { ValidationError } from "../../../../shared/errors";
import { compare } from "../../../../shared/helpers/date";
import { tuple } from "../../../../shared/helpers/tuple";
import { Duration, End, Start } from "../date";
import {
  Exception,
  type ExceptionDate,
  type UnvalidatedException,
} from "../exception/write";
import { CalendarId, EventId, generateEventId } from "../id";
import { Dtstart, RRule, Until } from "../rrule/write";
import { Title } from "../title";

interface _Event {
  id: EventId;
  calendar_id: CalendarId;
  title: Title;
  start: Start;
  end: End | Until;
  duration: Duration;
  is_recurring: boolean;
  is_all_day: boolean;
}

interface SingleEvent extends _Event {
  end: End;
  is_recurring: false;
}

interface RecurringEvent extends _Event {
  is_recurring: true;
  rrule: RRule;
  exceptions: Exception[];
  end: Until;
}

export type Event = SingleEvent | RecurringEvent;

type UnvalidatedRRule = {
  freq: number;
  until: string;
  dtstart: string;
};

type UnvalidatedInput = {
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
};

export const Event = {
  create: (input: UnvalidatedInput): Result<Event, ValidationError> => {
    const eventId = EventId.create(input.id);
    const title = Title.create(input.title);
    const start = Start.create(input.start);
    const duration = Duration.from(input.duration);
    const calendarId = CalendarId.create(input.calendar_id);

    if (!input.is_recurring) {
      const end = End.create(input.end);
      const values = tuple(eventId, title, start, end, duration, calendarId);

      return Result.combineWithAllErrors(values)
        .map(([eventId, title, start, end, duration, calendarId]) => {
          return {
            id: eventId,
            calendar_id: calendarId,
            title,
            start,
            end,
            duration,
            is_all_day: input.is_all_day,
            is_recurring: false,
          } satisfies SingleEvent;
        })
        .mapErr((errs) => new ValidationError(errs));
    }

    if (!input.rrule) {
      return err(new ValidationError(["EmptyRRule"]));
    }

    const until = Until.create(input.end);
    const exceptions = Result.combine(input.exceptions.map(Exception.create));
    const rrule = RRule.create(input.rrule);

    const values = Result.combineWithAllErrors(
      tuple(
        eventId,
        title,
        start,
        until,
        duration,
        calendarId,
        exceptions,
        rrule,
      ),
    );
    return values
      .map(
        ([
          eventId,
          title,
          start,
          until,
          duration,
          calendarId,
          exceptions,
          rrule,
        ]) => {
          return {
            id: eventId,
            calendar_id: calendarId,
            title,
            start,
            end: until,
            duration,
            is_all_day: input.is_all_day,
            is_recurring: true,
            rrule,
            exceptions,
          } satisfies RecurringEvent;
        },
      )
      .mapErr((errs) => new ValidationError(errs));
  },
};

type CreatedEvent<T = Event> = T & { kind: "created" };
type UpdatedEvent<T = Event> = T & { kind: "updated" };

export const updateEvent =
  (input: UpdateInput, pattern: OperationPattern) =>
  (
    event: Event,
  ): Result<{ update: UpdatedEvent; create?: CreatedEvent }, string> => {
    if (!event.is_recurring) {
      return updateSingleEvent(input)(event);
    }
    const updateRecurringEvent = recurringEventUpdater(input, pattern);
    const result = updateRecurringEvent(event);
    return result;
  };

const updateSingleEvent =
  (input: UpdateInput) =>
  (
    event: SingleEvent,
  ): Result<{ update: SingleEvent & { kind: "updated" } }, never> => {
    const singleEvent = {
      ...event,
      start: input.start,
      end: input.end,
      duration: input.duration,
      title: input.title,
      is_all_day: input.is_all_day,
    } satisfies SingleEvent;

    return ok({ update: { ...singleEvent, kind: "updated" } });
  };

type UpdateRecurringEvent<U = Event, C = Event> = (
  event: RecurringEvent,
) => Result<
  {
    update: UpdatedEvent<U>;
    create?: CreatedEvent<C>;
  },
  string
>;

const recurringEventUpdater = (
  input: UpdateInput,
  pattern: OperationPattern,
): UpdateRecurringEvent => {
  switch (pattern) {
    case OPERATION_PATTERN.THIS: {
      return updateThisEvent(input);
    }
    case OPERATION_PATTERN.FUTURE: {
      return updateFutureEvent(input);
    }
    case OPERATION_PATTERN.ALL: {
      return updateAllEvent(input);
    }
  }
};

const updateThisEvent =
  (input: UpdateInput): UpdateRecurringEvent<RecurringEvent, SingleEvent> =>
  (event: RecurringEvent) => {
    // Exceptions hashを作成
    const exHash = event.exceptions.reduce((prev, curr) => {
      const hashKey = curr.target_date.getTime();
      if (prev.has(hashKey)) {
        return prev;
      }
      prev.set(hashKey, curr);
      return prev;
    }, new Map<number, Exception>());

    const newHashKey = input.target_date.getTime();
    if (exHash.has(newHashKey)) {
      return err("ExistException");
    }

    // Exceptionsに追加
    const exception: Exception = {
      target_date: input.target_date,
      type: "modified",
    };
    exHash.set(newHashKey, exception);
    const exceptions = Array.from(exHash.values());

    const updatedEvent: UpdatedEvent<RecurringEvent> = {
      ...event,
      exceptions,
      kind: "updated",
    };

    // 例外の予定を作成
    const { rrule: _, is_recurring: _2, exceptions: _3, ...rest } = event;
    const createdEvent: CreatedEvent<SingleEvent> = {
      ...rest,
      id: generateEventId(),
      is_recurring: false,
      title: input.title,
      start: input.start,
      end: input.end,
      duration: input.duration,
      is_all_day: input.is_all_day,
      kind: "created",
    };

    return ok({ create: createdEvent, update: updatedEvent });
  };

const updateFutureEvent =
  (input: UpdateInput): UpdateRecurringEvent<RecurringEvent, RecurringEvent> =>
  (event: RecurringEvent) => {
    // 1. 既存のeventのuntilをtarget_dateまでに設定
    const existEvent = Until.create(input.target_date).map((until) => {
      return {
        ...event,
        rrule: { ...event.rrule, until },
      } as RecurringEvent;
    });
    // 2. target_dateがstartの新たなevent
    const dtstart = Dtstart.create(input.target_date);
    const futureEvent = dtstart.map(([dtstart]) => {
      return {
        ...event,
        id: generateEventId(),
        start: input.start,
        end: event.rrule.until,
        duration: input.duration,
        title: input.title,
        is_all_day: input.is_all_day,
        rrule: { ...event.rrule, dtstart },
        exceptions: [],
      } as RecurringEvent;
    });
    const values = Result.combine([existEvent, futureEvent]).map(
      ([exist, future]) =>
        ({
          update: { ...exist, kind: "updated" },
          create: { ...future, kind: "created" },
        }) as const,
    );

    return values;
  };

const updateAllEvent =
  (input: UpdateInput): UpdateRecurringEvent<RecurringEvent> =>
  (event: RecurringEvent) => {
    const changeEventTime =
      !compare(input.start, "=", event.start) ||
      !compare(input.end, "=", event.end);

    const updatedEvent: UpdatedEvent<RecurringEvent> = {
      ...event,
      start: input.start,
      title: input.title,
      is_all_day: input.is_all_day,
      duration: input.duration,
      // 時間が変更された場合、例外をクリアする
      exceptions: changeEventTime ? [] : event.exceptions,
      kind: "updated",
    };

    return ok({ update: updatedEvent });
  };

export const OPERATION_PATTERN = {
  THIS: 0,
  FUTURE: 1,
  ALL: 2,
} as const;

export type OperationPattern =
  (typeof OPERATION_PATTERN)[keyof typeof OPERATION_PATTERN];
export const OperationPattern = {
  create: (value: number): Result<OperationPattern, string> => {
    const values: number[] = Object.values(OPERATION_PATTERN);
    if (!values.includes(value)) {
      return err("InvalidOperationPattern");
    }
    return ok(value as OperationPattern);
  },
};

type UpdateInput = {
  target_date: ExceptionDate;
  title: Title;
  start: Start;
  end: End;
  duration: Duration;
  is_all_day: boolean;
};

type DeletedEvent = { id: EventId; kind: "deleted" } | UpdatedEvent;

export const deleteEvent = (
  event: Event,
  input: { target_date: ExceptionDate; pattern: OperationPattern },
): Result<DeletedEvent, string> => {
  if (!event.is_recurring) {
    return ok({ id: event.id, kind: "deleted" });
  }

  switch (input.pattern) {
    case OPERATION_PATTERN.THIS: {
      const updatedEvent: UpdatedEvent = {
        ...event,
        exceptions: [
          ...event.exceptions,
          {
            target_date: input.target_date,
            type: "cancelled",
          },
        ],
        kind: "updated",
      };
      return ok(updatedEvent);
    }

    case OPERATION_PATTERN.FUTURE: {
      const _until = new Date(input.target_date).getTime() - 1;
      return Until.create(_until).map((until) => {
        return {
          ...event,
          rrule: {
            ...event.rrule,
            until,
          },
          kind: "updated",
        };
      });
    }

    case OPERATION_PATTERN.ALL: {
      return ok({ id: event.id, kind: "deleted" });
    }
  }
};

// 編集・削除したときの影響範囲を算出する
export const getAffectedRange = (
  event: Event,
  {
    pattern,
    target_date,
  }: { pattern: OperationPattern; target_date: ExceptionDate },
): { start: Date; end: Date } => {
  if (!event.is_recurring) return { start: event.start, end: event.end };

  switch (pattern) {
    case OPERATION_PATTERN.THIS:
      return {
        start: target_date,
        end: target_date,
      };

    case OPERATION_PATTERN.FUTURE:
    case OPERATION_PATTERN.ALL:
      return {
        start: event.start,
        end: event.rrule.until,
      };
  }
};
