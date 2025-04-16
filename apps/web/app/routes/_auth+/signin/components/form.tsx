import { Form } from "~/components/form/form";
import TextField from "~/components/form/text-field";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/field";
import { Input } from "~/components/ui/textfield";

import { SigninSchema, signinSchema } from "../schema";

type Props = {
  onSubmit?: (data: SigninSchema) => void;
};

export const SigninForm: React.FC<Props> = ({ onSubmit }) => {
  return (
    <Form
      method="post"
      schema={signinSchema}
      onSubmit={(context, { submission }) => {
        context.stopPropagation();
        context.preventDefault();
        if (submission?.status === "success") {
          onSubmit?.(submission.value);
          return;
        }
      }}
    >
      <div className="flex flex-col gap-3 pb-4">
        <TextField id="email" name="email" type="email">
          <Label htmlFor="email">Email</Label>
          <Input className="w-full" />
        </TextField>
        <TextField id="password" name="password" type="password">
          <Label>Password</Label>
          <Input className="w-full" />
        </TextField>
      </div>
      <div>
        <Button className="w-full" type="submit">
          Sign in
        </Button>
      </div>
    </Form>
  );
};
