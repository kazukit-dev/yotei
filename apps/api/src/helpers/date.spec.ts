import { describe, expect, test } from "vitest";

import { between, compare, isValidDate } from "./date";

describe("between", () => {
  const target = new Date("2024-01-01T00:00:00.000Z");
  const range_1 = [
    new Date("2024-01-01T00:00:00.000Z"),
    new Date("2024-02-01T10:00:00.000Z"),
  ] as const;
  const range_2 = [
    new Date("2023-12-01T00:00:00.000Z"),
    new Date("2024-02-01T10:00:00.000Z"),
  ] as const;
  const range_3 = [
    new Date("2023-12-01T00:00:00.000Z"),
    new Date("2024-01-01T00:00:00.000Z"),
  ] as const;

  test.each([
    [target, ...range_1, false],
    [target, ...range_2, true],
    [target, ...range_3, false],
  ])(
    "between: target %s, from %s, to %s should be %s",
    (target, from, to, expected) => {
      expect(between(target, from, to)).toBe(expected);
    },
  );
});

describe("compare", () => {
  const target = new Date("2024-01-01T00:00:00.000Z");

  const value_1 = new Date("2023-12-01T00:00:00.000Z");
  const value_2 = new Date("2024-01-01T00:00:00.000Z");
  const value_3 = new Date("2024-02-01T00:00:00.000Z");

  test.each([
    [target, "<", value_1, false],
    [target, "<", value_2, false],
    [target, "<", value_3, true],
    [target, "<=", value_1, false],
    [target, "<=", value_2, true],
    [target, "<=", value_3, true],
    [target, ">", value_1, true],
    [target, ">", value_2, false],
    [target, ">", value_3, false],
    [target, ">=", value_1, true],
    [target, ">=", value_2, true],
    [target, ">=", value_3, false],
    [target, "=", value_1, false],
    [target, "=", value_2, true],
    [target, "=", value_3, false],
  ] as const)("%s %s %s", (left, operator, right, expected) => {
    expect(compare(left, operator, right)).toBe(expected);
  });
});

describe("isValidDate", () => {
  test("Valid date", () => {
    expect(isValidDate("2024-01-01")).toBeTruthy();
    expect(isValidDate(1737379124471)).toBeTruthy();
  });
  test("Invalid date", () => {
    expect(isValidDate("Invalid date")).toBeFalsy();
    expect(isValidDate("2024-04-32")).toBeFalsy();
    expect(isValidDate(-9999)).toBeFalsy();
  });
});
