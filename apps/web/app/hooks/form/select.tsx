import { type FieldMetadata, useInputControl } from "@conform-to/react";
import type { Key } from "react";

export const useSelect = (meta: FieldMetadata<string>) => {
  const control = useInputControl(meta);

  return {
    name: meta.name,
    selectedKey: control.value ? control.value : null,
    // defaultSelectedKey: meta.initialValue ?? "",
    onSelectionChange: (value: Key | null) => {
      if (value) {
        control.change(value.toString());
      }
    },
    onOpenChange: (open: boolean) => {
      if (!open) {
        control.blur();
      }
    },
  };
};
