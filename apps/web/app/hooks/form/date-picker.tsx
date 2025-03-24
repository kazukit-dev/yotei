import { type FieldMetadata, useInputControl } from "@conform-to/react";
import {
  type CalendarDate,
  type CalendarDateTime,
  parseDate,
  type ZonedDateTime,
} from "@internationalized/date";

export const useDatePicker = (
  meta: FieldMetadata<string, Record<string, unknown>, string[]>,
  options: {
    minValue?: string;
    maxValue?: string;
    value?: string;
  },
) => {
  const control = useInputControl(meta);
  const minValue = options.minValue ? parseDate(options.minValue) : null;
  const maxValue = options.maxValue ? parseDate(options.maxValue) : null;

  return {
    name: meta.name,
    value: control.value
      ? parseDate(control.value)
      : options.value
        ? parseDate(options.value)
        : null,
    onChange: (
      value: CalendarDate | CalendarDateTime | ZonedDateTime | null,
    ) => {
      if (value) {
        control.change(value.toString());
      }
    },
    onOpenChange: (open: boolean) => {
      if (!open) {
        control.blur();
      } else {
        control.focus();
      }
    },
    maxValue,
    minValue,
  };
};
