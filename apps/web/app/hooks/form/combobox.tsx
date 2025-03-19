import { type FieldMetadata, useInputControl } from "@conform-to/react";
import type { Key } from "react";

export const useCombobox = (meta: FieldMetadata<string>) => {
  const control = useInputControl(meta);

  return {
    name: meta.name,
    selectedKey: control.value ? control.value : null,
    inputValue: control.value ? control.value : "",
    onSelectionChange: (key: Key | null) => {
      key && control.change(key.toString());
    },
    onInputChange: (value: string) => {
      value && control.change(value);
    },
    onOpenChange: (open: boolean) => {
      if (!open) {
        control.blur();
      }
    },
  };
};
