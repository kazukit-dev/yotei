import { type FieldMetadata, useInputControl } from "@conform-to/react";

export const useSwitch = (meta: FieldMetadata<boolean>) => {
  const control = useInputControl(meta);

  return {
    name: meta.name,
    isSelected: control.value === "on",
    onBlur: () => control.blur(),
    onFocus: () => control.focus(),
    onChange: (value: boolean) => {
      control.change(value ? "on" : "");
    },
  };
};
