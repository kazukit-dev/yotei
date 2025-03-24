import { type FieldName, useField } from "@conform-to/react";
import type { ComponentProps } from "react";

import { Switch as RACSwitch } from "~/components/ui/switch";
import { useSwitch } from "~/hooks/form/switch";

interface Props
  extends Omit<ComponentProps<typeof RACSwitch>, "name" | "isSelected"> {
  name: FieldName<boolean>;
}

export const Switch: React.FC<Props> = ({ name, ...props }) => {
  const [meta] = useField(name);
  const switchProps = useSwitch(meta);

  return <RACSwitch {...props} {...switchProps} />;
};
