import { describe, expect, it } from "vitest";

import { getRecurringDates, type RRule } from "../read/rrule";

describe("getRecurringDates", () => {
  it("should return recurring dates based on the given rule", () => {
    const rrule: RRule = {
      freq: 3,
      dtstart: new Date("2023-10-01T00:00:00Z"),
      until: new Date("2023-10-10T00:00:00Z"),
    };
    const from = new Date("2023-10-01T00:00:00Z");
    const to = new Date("2023-10-07T00:00:00Z");

    const result = getRecurringDates(from, to)(rrule);

    expect(result).toEqual([
      new Date("2023-10-01T00:00:00.000Z"),
      new Date("2023-10-02T00:00:00.000Z"),
      new Date("2023-10-03T00:00:00.000Z"),
      new Date("2023-10-04T00:00:00.000Z"),
      new Date("2023-10-05T00:00:00.000Z"),
      new Date("2023-10-06T00:00:00.000Z"),
      new Date("2023-10-07T00:00:00.000Z"),
    ]);
  });
});
