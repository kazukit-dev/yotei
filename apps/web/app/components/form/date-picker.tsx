import { type FieldName, useField } from "@conform-to/react";
import type { ComponentProps } from "react";
import { JollyDatePicker } from "~/components/ui/date-picker";
import { useDatePicker } from "~/hooks/form/date-picker";

interface Props
  extends Omit<
    ComponentProps<typeof JollyDatePicker>,
    "minValue" | "maxValue" | "onChange" | "onOpenChange" | "value"
  > {
  name: FieldName<string>;
  minValue?: string;
  maxValue?: string;
  value?: string;
}

const DatePicker = ({ name, minValue, maxValue, value, ...props }: Props) => {
  const [meta] = useField(name);
  const datePicker = useDatePicker(meta, { minValue, maxValue, value });

  return <JollyDatePicker {...props} {...datePicker} />;
};

export default DatePicker;
