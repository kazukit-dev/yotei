import { afterEach, describe, expect, test, vi } from "vitest";
import * as RRule from "../rrule/read";
import { type Event, getOccurrences } from "./read";

const getRecurringDates = vi.spyOn(RRule, "getRecurringDates");

const singleEvent: Event = {
  id: "1",
  calendar_id: "cal1",
  title: "Single Event",
  start: new Date("2023-10-01T10:00:00Z"),
  end: new Date("2023-10-01T11:00:00Z"),
  duration: 3600,
  is_recurring: false,
  is_all_day: false,
  version: 1,
};

const _recurringEvent: Event = {
  id: "3",
  calendar_id: "cal3",
  title: "Recurring Event with Exceptions",
  start: new Date("2023-10-01T10:00:00Z"),
  end: new Date("2023-12-31T11:00:00Z"),
  duration: 3600,
  is_recurring: true,
  is_all_day: false,
  exceptions: [],
  rrule: {
    freq: 3,
    until: new Date("2023-12-31T11:00:00Z"),
    dtstart: new Date("2023-10-01T10:00:00Z"),
  },
  version: 1,
};

const recurringEventWithoutExceptions: Event = {
  ..._recurringEvent,
  exceptions: [],
};

const recurringEventWithExceptions: Event = {
  ..._recurringEvent,
  exceptions: [
    {
      target_date: new Date("2023-10-02T10:00:00Z"),
      type: "cancelled",
    },
  ],
};

afterEach(() => {
  vi.resetAllMocks();
});

describe("getOccurrences", () => {
  test("should return occurrences for a single event", () => {
    const from = new Date("2024-01-01");
    const to = new Date("2024-01-02");
    getRecurringDates.mockReturnValue(() => []);

    const occurrences = getOccurrences(from, to)(singleEvent);

    expect(occurrences).toHaveLength(1);
    expect(occurrences[0]).toEqual({
      id: singleEvent.id,
      start: new Date("2023-10-01T10:00:00Z"),
      end: new Date("2023-10-01T11:00:00Z"),
      title: "Single Event",
      is_all_day: false,
    });
  });

  test("should return occurrences for a recurring event", () => {
    const from = new Date("2024-01-01");
    const to = new Date("2024-01-02");
    getRecurringDates.mockReturnValue(() => [
      new Date("2023-10-01T10:00:00Z"),
      new Date("2023-10-02T10:00:00Z"),
      new Date("2023-10-03T10:00:00Z"),
      new Date("2023-10-04T10:00:00Z"),
      new Date("2023-10-05T10:00:00Z"),
    ]);

    const occurrences = getOccurrences(
      from,
      to,
    )(recurringEventWithoutExceptions);

    expect(occurrences).toHaveLength(5);
  });

  test("should handle modified or cancelled exceptions in recurring events", () => {
    const from = new Date("2024-01-01");
    const to = new Date("2024-01-02");
    getRecurringDates.mockReturnValue(() => [
      new Date("2023-10-01T10:00:00Z"),
      new Date("2023-10-02T10:00:00Z"),
      new Date("2023-10-03T10:00:00Z"),
      new Date("2023-10-04T10:00:00Z"),
      new Date("2023-10-05T10:00:00Z"),
    ]);

    const occurrences = getOccurrences(from, to)(recurringEventWithExceptions);

    expect(occurrences).toHaveLength(4);
    expect(occurrences).not.toContainEqual(
      expect.objectContaining({
        start: new Date("2023-10-02T10:00:00Z"),
      }),
    );
  });
});
