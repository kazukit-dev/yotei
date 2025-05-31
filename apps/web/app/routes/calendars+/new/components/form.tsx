import { Form } from "~/components/form/form";
import TextField from "~/components/form/text-field";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/field";
import { Input } from "~/components/ui/textfield";

import { CalendarCreateSchema, calendarCreateSchema } from "../schema";

type Props = {
  onSubmit?: (data: CalendarCreateSchema) => void;
};

export const CalendarCreateForm: React.FC<Props> = ({ onSubmit }) => {
  return (
    <Form
      id="calendar-create-form"
      schema={calendarCreateSchema}
      method="post"
      onSubmit={(context, { submission }) => {
        context.stopPropagation();
        context.preventDefault();
        if (submission?.status === "success") {
          onSubmit?.(submission.value);
          return;
        }
      }}
    >
      <TextField name="name">
        <Label>Calendar Name</Label>
        <Input />
      </TextField>

      <div className="flex justify-end gap-5 pt-5">
        <Button className="w-28" variant="outline">
          Cancel
        </Button>
        <Button type="submit" className="w-28">
          Create
        </Button>
      </div>
    </Form>
  );
};
