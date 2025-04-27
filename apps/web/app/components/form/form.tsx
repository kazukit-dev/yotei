import {
  type DefaultValue,
  FormProvider,
  getFormProps,
  useForm,
} from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import type { ComponentProps, PropsWithChildren } from "react";
import { Form as RACForm } from "react-aria-components";
import type { z, ZodAny, ZodSchema } from "zod";

type RACFormProps = ComponentProps<typeof RACForm>;

interface FormProps<Schema extends ZodSchema>
  extends Omit<RACFormProps, "onSubmit" | "method" | "defaultValue"> {
  id?: string;
  onSubmit?: Parameters<typeof useForm<z.infer<Schema>>>[0]["onSubmit"];
  defaultValue?: DefaultValue<z.infer<ZodAny>>;
  schema: Schema;
  method?: "post" | "get" | "dialog";
}

export const Form = <Schema extends ZodSchema>({
  id,
  defaultValue,
  onSubmit,
  schema,
  children,
  method = "post",
  ...props
}: PropsWithChildren<FormProps<Schema>>) => {
  const [form] = useForm<z.infer<Schema>>({
    id,
    defaultValue,
    onSubmit,
    onValidate: ({ formData }) => parseWithZod(formData, { schema }),
    constraint: getZodConstraint(schema),
    shouldValidate: "onInput",
  });

  return (
    <FormProvider context={form.context}>
      <RACForm {...getFormProps(form)} method={method} {...props}>
        {children}
      </RACForm>
    </FormProvider>
  );
};
