import { type FieldName, useField } from "@conform-to/react";
import type { ComponentProps } from "react";
import { useCombobox } from "~/hooks/form/combobox";
import { TimePicker as _TimePicker } from "../ui/time-field";

interface Props
  extends Omit<ComponentProps<typeof _TimePicker>, "name" | "defaultValue"> {
  name: FieldName<string>;
}

export const TimePicker: React.FC<Props> = ({ name, ...props }) => {
  const [meta] = useField(name);
  const timePicker = useCombobox(meta);

  return <_TimePicker {...props} {...timePicker} />;
};
