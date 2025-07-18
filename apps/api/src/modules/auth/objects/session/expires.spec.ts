import { describe, expect, test } from "vitest";

import {
  createSessionExpiresAt,
  createSessionMaxAge,
  generateSessionExpiresAt,
  generateSessionMaxAge,
} from "./expires";

// Generated by Copilot

describe("createSessionExpiresAt", () => {
  test("should create valid session expires at", () => {
    const date = new Date("2024-01-01T10:00:00Z");
    const result = createSessionExpiresAt(date);

    expect(result._unsafeUnwrap()).toBe(date);
  });

  test("should accept any valid date", () => {
    const futureDate = new Date("2025-12-31T23:59:59Z");
    const result = createSessionExpiresAt(futureDate);

    expect(result._unsafeUnwrap()).toBe(futureDate);
  });
});

describe("createSessionMaxAge", () => {
  test("should create valid session max age", () => {
    const maxAge = 3600; // 1 hour
    const result = createSessionMaxAge(maxAge);

    expect(result._unsafeUnwrap()).toBe(maxAge);
  });

  test("should reject zero value", () => {
    const result = createSessionMaxAge(0);

    expect(result._unsafeUnwrapErr()).toBe("InvalidMaxAge");
  });

  test("should reject null value", () => {
    const result = createSessionMaxAge(null as unknown as number);

    expect(result._unsafeUnwrapErr()).toBe("InvalidMaxAge");
  });

  test("should accept large values", () => {
    const maxAge = 86400; // 24 hours
    const result = createSessionMaxAge(maxAge);

    expect(result._unsafeUnwrap()).toBe(maxAge);
  });
});

describe("generateSessionExpiresAt", () => {
  test("should generate future expiration date", () => {
    const now = new Date();
    const expiresAt = generateSessionExpiresAt();

    expect(expiresAt.getTime()).toBeGreaterThan(now.getTime());
  });

  test("should generate expiration approximately 1 day in future", () => {
    const now = new Date();
    const expiresAt = generateSessionExpiresAt();
    const diffInHours =
      (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60);

    expect(diffInHours).toBeGreaterThan(23);
    expect(diffInHours).toBeLessThan(25);
  });
});

describe("generateSessionMaxAge", () => {
  test("should generate default max age", () => {
    const maxAge = generateSessionMaxAge();

    expect(maxAge).toBe(86400); // 24 hours in seconds
  });
});
