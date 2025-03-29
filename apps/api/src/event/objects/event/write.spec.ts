import { describe, expect, test } from "vitest";

import { Duration, type End, Start } from "../date";
import { Exception, type ExceptionDate } from "../exception/write";
import { CalendarId, EventId } from "../id";
import { RRule, Until } from "../rrule/write";
import { Title } from "../title";
import {
  deleteEvent,
  type Event,
  OPERATION_PATTERN,
  updateEvent,
} from "./write";

const singleEvent = {
  id: "1" as EventId,
  title: "Single Event" as Title,
  start: new Date("2023-01-01") as Start,
  end: new Date("2023-01-02") as End,
  duration: 1 as Duration,
  calendar_id: "1" as CalendarId,
  is_all_day: false,
  is_recurring: false,
} satisfies Event;

const rrule = RRule.create({
  freq: 3,
  until: new Date("2023-01-10"),
  dtstart: new Date("2023-01-01"),
})._unsafeUnwrap();

const recurringEventWithoutException = {
  id: EventId.create("1")._unsafeUnwrap(),
  title: Title.create("Single Event")._unsafeUnwrap(),
  start: Start.create(new Date("2023-01-01"))._unsafeUnwrap(),
  end: Until.create(new Date("2023-01-10"))._unsafeUnwrap(),
  duration: Duration.from(360000)._unsafeUnwrap(),
  calendar_id: CalendarId.create("1")._unsafeUnwrap(),
  is_all_day: true,
  is_recurring: true,
  rrule,
  exceptions: [],
} satisfies Event;

const exceptions = [
  Exception.create({
    target_date: "2023-01-08",
    type: "modified",
  })._unsafeUnwrap(),
];

const recurringEventWithException = {
  id: EventId.create("1")._unsafeUnwrap(),
  title: Title.create("Single Event")._unsafeUnwrap(),
  start: Start.create(new Date("2023-01-01"))._unsafeUnwrap(),
  end: Until.create(new Date("2023-01-10"))._unsafeUnwrap(),
  duration: Duration.from(360000)._unsafeUnwrap(),
  calendar_id: CalendarId.create("1")._unsafeUnwrap(),
  is_all_day: true,
  is_recurring: true,
  rrule,
  exceptions: exceptions,
} satisfies Event;

describe("updateEvent", () => {
  test("should update single event with valid data", () => {
    const input = {
      title: "Updated Event" as Title,
      start: new Date("2023-02-01") as Start,
      end: new Date("2023-02-02") as End,
      duration: 1 as Duration,
      is_all_day: false,
      target_date: new Date("2023-01-01") as ExceptionDate,
    };

    const result = updateEvent(input, 0)(singleEvent);
    expect(result.isOk()).toBe(true);
    expect(result._unsafeUnwrap()).not.toHaveProperty("create");
    expect(result._unsafeUnwrap()).toHaveProperty(
      "update",
      expect.objectContaining({
        title: input.title,
        start: input.start,
        end: input.end,
      }),
    );
  });
  describe("Recurring event", () => {
    describe("Pattern: this", () => {
      test("without exception", () => {
        const input = {
          title: "Updated Event" as Title,
          start: new Date("2023-02-01") as Start,
          end: new Date("2023-02-02") as End,
          duration: 86400000 as Duration,
          is_all_day: false,
          target_date: new Date("2023-01-01") as ExceptionDate,
        };

        const result = updateEvent(input, 0)(recurringEventWithoutException);
        expect(result.isOk()).toBe(true);
        const { create, update } = result._unsafeUnwrap();
        expect(create).toEqual(
          expect.objectContaining({
            title: input.title,
            start: input.start,
            end: input.end,
            is_all_day: input.is_all_day,
            kind: "created",
          }),
        );
        expect(update).toHaveProperty("exceptions", [
          {
            target_date: input.target_date,
            type: "modified",
          },
        ]);
      });
      test("with exception", () => {
        const input = {
          title: "Modified Updated Event" as Title,
          start: new Date("2023-01-08") as Start,
          end: new Date("2023-01-09") as End,
          duration: 86400000 as Duration,
          is_all_day: false,
          target_date: new Date("2023-01-08") as ExceptionDate,
        };

        const result = updateEvent(input, 0)(recurringEventWithException);
        expect(result.isErr()).toBeTruthy();
      });
    });
    describe("Pattern: future", () => {
      test("should update recurring event with future pattern", () => {
        const input = {
          title: "Updated Event" as Title,
          start: new Date("2023-02-01") as Start,
          end: new Date("2023-02-02") as End,
          duration: 86400000 as Duration,
          is_all_day: true,
          target_date: new Date("2023-01-06") as ExceptionDate,
        };

        const result = updateEvent(input, 1)(recurringEventWithException);
        expect(result.isOk()).toBe(true);

        const data = result._unsafeUnwrap();
        expect(data).toHaveProperty(
          "update",
          expect.objectContaining({
            rrule: {
              ...recurringEventWithoutException.rrule,
              until: new Date("2023-01-06"),
            },
          }),
        );

        expect(data).toHaveProperty(
          "create",
          expect.objectContaining({
            title: input.title,
            start: input.start,
            end: recurringEventWithException.end,
            duration: input.duration,
            rrule: {
              ...recurringEventWithoutException.rrule,
              dtstart: input.target_date,
            },
            exceptions: [],
          }),
        );
      });
    });

    describe("Pattern: all", () => {
      test("should update recurring event with all pattern", () => {
        const input = {
          title: "Updated Event" as Title,
          start: new Date("2023-02-01") as Start,
          end: new Date("2023-02-02") as End,
          duration: 86400000 as Duration,
          is_all_day: true,
          target_date: new Date("2023-01-06") as ExceptionDate,
        };

        const result = updateEvent(input, 2)(recurringEventWithException);
        expect(result.isOk()).toBe(true);

        const data = result._unsafeUnwrap();
        expect(data).not.toHaveProperty("create");
        expect(data).toHaveProperty(
          "update",
          expect.objectContaining({
            title: input.title,
            start: input.start,
            duration: input.duration,
            is_all_day: input.is_all_day,
          }),
        );
      });
    });
    describe("deleteEvent", () => {
      describe("Single Event", () => {
        test("should delete a single event", () => {
          const input = {
            target_date: new Date("2023-01-01") as ExceptionDate,
            pattern: OPERATION_PATTERN.THIS,
          };

          const result = deleteEvent(singleEvent, input);
          expect(result.isOk()).toBe(true);
          expect(result._unsafeUnwrap()).toEqual({
            id: singleEvent.id,
            kind: "deleted",
          });
        });
      });

      describe("Recurring Event", () => {
        describe("Pattern: this", () => {
          test("should add a cancelled exception for the target date", () => {
            const input = {
              target_date: new Date("2023-01-08") as ExceptionDate,
              pattern: OPERATION_PATTERN.THIS,
            };

            const result = deleteEvent(recurringEventWithException, input);
            expect(result.isOk()).toBe(true);

            const updatedEvent = result._unsafeUnwrap();
            expect(updatedEvent).toHaveProperty("kind", "updated");
            expect(updatedEvent).toHaveProperty("exceptions", [
              ...recurringEventWithException.exceptions,
              {
                target_date: input.target_date,
                type: "cancelled",
              },
            ]);
          });
        });

        describe("Pattern: future", () => {
          test("should update the recurring event's rrule until the target date", () => {
            const input = {
              target_date: new Date("2023-01-06") as ExceptionDate,
              pattern: OPERATION_PATTERN.FUTURE,
            };

            const result = deleteEvent(recurringEventWithException, input);
            expect(result.isOk()).toBe(true);

            const updatedEvent = result._unsafeUnwrap();
            expect(updatedEvent).toHaveProperty("kind", "updated");
            expect(updatedEvent).toHaveProperty(
              "rrule",
              expect.objectContaining({
                ...recurringEventWithException.rrule,
                until: new Date(new Date(input.target_date).getTime() - 1),
              }),
            );
          });
        });

        describe("Pattern: all", () => {
          test("should delete the entire recurring event", () => {
            const input = {
              target_date: new Date("2023-01-06") as ExceptionDate,
              pattern: OPERATION_PATTERN.ALL,
            };

            const result = deleteEvent(recurringEventWithException, input);
            expect(result.isOk()).toBe(true);
            expect(result._unsafeUnwrap()).toEqual({
              id: recurringEventWithException.id,
              kind: "deleted",
            });
          });
        });
      });
    });
  });
});
