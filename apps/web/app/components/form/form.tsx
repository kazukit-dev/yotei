import {
  type DefaultValue,
  FormProvider,
  getFormProps,
  useForm,
} from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import type { PropsWithChildren } from "react";
import { Form as RACForm } from "react-aria-components";
import type { z,ZodAny, ZodSchema } from "zod";

interface FormProps<Schema extends ZodSchema> {
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
      <RACForm {...getFormProps(form)} method={method}>
        {children}
      </RACForm>
    </FormProvider>
  );
};
