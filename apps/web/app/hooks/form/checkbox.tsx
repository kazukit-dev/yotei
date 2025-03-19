import { type FieldMetadata, useInputControl } from "@conform-to/react";

export const useCheckboxForm = (
  meta: FieldMetadata<boolean, Record<string, unknown>, string[]>,
) => {
  const control = useInputControl(meta);

  return {
    id: meta.id,
    name: meta.name,
    onBlur: control.blur,
    defaultSelected: meta.initialValue === "on",
    onChange: (checked: boolean) => {
      control.change(checked ? "on" : "");
    },
  };
};
