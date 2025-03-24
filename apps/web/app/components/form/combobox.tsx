import { type FieldName, useField } from "@conform-to/react";
import type { ComponentProps } from "react";

import { useCombobox } from "~/hooks/form/combobox";

import { Combobox as _Combobox } from "../ui/combobox";

interface Props
  extends Omit<
    ComponentProps<typeof _Combobox>,
    "name" | "defaultSelectedKey" | "selectedKey"
  > {
  name: FieldName<string>;
}

export const Combobox: React.FC<Props> = ({ name, ...props }) => {
  const [meta] = useField(name);
  const combobox = useCombobox(meta);

  return <_Combobox {...props} {...combobox} />;
};
