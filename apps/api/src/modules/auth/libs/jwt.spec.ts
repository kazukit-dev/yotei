import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { signJwt, verifyJwt } from "./jwt";

const secret = "secret";

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2025-04-04"));
});

afterEach(() => {
  vi.useRealTimers();
});

describe("signJwt", () => {
  test("should sign a JWT with the given payload and expiration time", async () => {
    const payload = { userId: "123" };
    const jwt = await signJwt(secret)(payload, "7h");

    expect(jwt).toBeDefined();
  });
});

describe("verifyJwt", () => {
  test("should verify a JWT and return the decoded payload", async () => {
    const jwt =
      "eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiIxMjMiLCJleHAiOjE3NDM4MDIyMDd9.l0EqQPkHodwYmBKwfJCFDvJMILRQ8k8XXCH_JnC5wJQ";

    const payload = await verifyJwt(secret)(jwt);

    expect(payload).toEqual({
      header: {
        alg: "HS256",
      },
      payload: {
        exp: 1743802207,
        userId: "123",
      },
    });
  });

  test("should throw an error if the JWT is invalid", async () => {
    const jwt = "invalid.jwt.token";

    const verify = verifyJwt(secret);

    await expect(verify(jwt)).rejects.toThrowError();
  });
  test("should throw an error if the JWT is expired", async () => {
    const jwt =
      "eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiIxMjMiLCJleHAiOjE3NDM2NjM2MDB9.Zir1yFqQFNbn8Ho3V4zEZmnYp7NRScT56FwSmyke_Ko";

    const verify = verifyJwt(secret);

    await expect(verify(jwt)).rejects.toThrowError();
  });
});
