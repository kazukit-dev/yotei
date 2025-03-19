import { type FieldName, getInputProps, useField } from "@conform-to/react";
import type { ComponentProps } from "react";
import { TextField as _TextField } from "../ui/textfield";

interface Props
  extends Omit<ComponentProps<typeof _TextField>, "onChange" | "defaultValue"> {
  name: FieldName<string>;
}

const TextField = ({ name, ...props }: Props) => {
  const [meta] = useField(name);
  return <_TextField {...props} {...getInputProps(meta, { type: "text" })} />;
};
export default TextField;
