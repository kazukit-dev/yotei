import { type FieldMetadata, useInputControl } from "@conform-to/react";
import {
  type CalendarDateTime,
  parseTime,
  type Time,
  type ZonedDateTime,
} from "@internationalized/date";

export const useTimeField = (
  meta: FieldMetadata<string>,
  options?: { defaultValue?: string },
) => {
  const control = useInputControl(meta);

  return {
    name: meta.name,
    defaultValue: options?.defaultValue
      ? parseTime(options.defaultValue)
      : null,
    value: control.value ? parseTime(control.value) : null,
    onChange: (value: Time | CalendarDateTime | ZonedDateTime | null) => {
      if (value) {
        control.change(value.toString());
      }
    },
  };
};
