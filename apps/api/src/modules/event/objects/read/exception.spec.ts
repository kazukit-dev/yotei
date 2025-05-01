import { describe, expect, test } from "vitest";

import { createException } from "../read/exception";

describe("Exceptions", () => {
  describe("create", () => {
    test("未検証の値からドメインオブジェクトを作成", () => {
      const unvalidated = {
        target_date: "2025-01-01T13:00:00.000Z",
        type: "modified",
      };

      const ex = createException(unvalidated);

      expect(ex._unsafeUnwrap()).toEqual({
        ...unvalidated,
        target_date: new Date("2025-01-01T13:00:00.000Z"),
      });
    });
    test("不正なtypeだった場合、エラーがとなる", () => {
      const unvalidated = {
        target_date: "2025-01-01T13:00:00.000Z",
        type: "invalid-type",
      };

      const ex = createException(unvalidated);

      expect(ex.isErr()).toBeTruthy();
    });
  });
});
