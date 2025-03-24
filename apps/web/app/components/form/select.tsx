import { type FieldName, useField } from "@conform-to/react";
import type { ComponentProps } from "react";

import { useSelect } from "~/hooks/form/select";

import { Select as _Select } from "../ui/select";

interface Props
  extends Omit<
    ComponentProps<typeof _Select>,
    "name" | "defaultSelectedKey" | "selectedKey"
  > {
  name: FieldName<string>;
}

const Select = ({ name, ...props }: Props) => {
  const [meta] = useField(name);
  const select = useSelect(meta);
  return <_Select {...props} {...select} />;
};

export default Select;
