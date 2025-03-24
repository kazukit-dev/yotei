import { type FieldName, useField } from "@conform-to/react";
import type { ComponentProps } from "react";

import { useTimeField } from "~/hooks/form/time-field";

import { JollyTimeField } from "../ui/datefield";

interface Props
  extends Omit<ComponentProps<typeof JollyTimeField>, "defaultValue"> {
  name: FieldName<string>;
  defaultValue?: string;
}

const TimeField = ({ name, defaultValue, ...props }: Props) => {
  const [meta] = useField(name);
  const timeField = useTimeField(meta, { defaultValue });

  return <JollyTimeField {...props} {...timeField} />;
};

export default TimeField;
