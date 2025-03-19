import { type FieldName, useField } from "@conform-to/react";
import type { ComponentProps } from "react";
import { RadioGroup as _RadioGroup } from "~/components/ui/radio-group";
import { useRadio } from "~/hooks/form/radio";

interface Props
  extends Omit<
    ComponentProps<typeof _RadioGroup>,
    "name" | "defaultValue" | "onChange"
  > {
  name: FieldName<string>;
}

export const RadioGroup: React.FC<Props> = ({ name, ...props }) => {
  const [meta] = useField(name);
  const radio = useRadio(meta);
  return <_RadioGroup {...props} {...radio} />;
};
