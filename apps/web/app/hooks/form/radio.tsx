import { type FieldMetadata, useInputControl } from "@conform-to/react";

export const useRadio = (meta: FieldMetadata<string>) => {
  const control = useInputControl(meta);

  return {
    name: meta.name,
    defaultValue: meta.initialValue,
    onChang: (value: string) => {
      control.change(value);
    },
    onBlur: () => {
      control.blur();
    },
    onFocus: () => {
      control.focus();
    },
    onFocusChange: (value: boolean) => {
      if (value) {
        control.focus();
      } else {
        control.blur();
      }
    },
  };
};
