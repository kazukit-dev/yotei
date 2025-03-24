import { err, ok,type Result } from "neverthrow";

interface _Exception {
  target_date: Date;
  type: string;
}

interface CancelledException extends _Exception {
  type: "cancelled";
}

interface ModifiedException extends _Exception {
  type: "modified";
}

export type Exception = CancelledException | ModifiedException;

export interface UnvalidatedException {
  target_date: string;
  type: string;
}

export const Exception = {
  create: (input: UnvalidatedException): Result<Exception, string> => {
    const targetDate = new Date(input.target_date);
    if (input.type !== "modified" && input.type !== "cancelled") {
      return err("InvalidExceptionType");
    }
    return ok({
      target_date: targetDate,
      type: input.type,
    });
  },
} as const;
