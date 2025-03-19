import { type FieldName, useField } from "@conform-to/react";
import type { ComponentProps } from "react";
import { useCheckboxForm } from "~/hooks/form/checkbox";
import { Checkbox as _Checkbox } from "../ui/checkbox";

interface Props extends ComponentProps<typeof _Checkbox> {
  name: FieldName<boolean>;
}

const Checkbox = ({ name, ...props }: Props) => {
  const [meta] = useField(name);
  const checkbox = useCheckboxForm(meta);

  return <_Checkbox {...props} {...checkbox} />;
};

export default Checkbox;
