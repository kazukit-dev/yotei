import { type FieldMetadata, useInputControl } from "@conform-to/react";
import {
  type CalendarDateTime,
  type Time,
  type ZonedDateTime,
  parseTime,
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
      value && control.change(value.toString());
    },
  };
};
