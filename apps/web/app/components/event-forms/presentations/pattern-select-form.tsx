import { Form } from "~/components/form/form";
import { RadioGroup } from "~/components/form/radio";
import { Radio } from "~/components/ui/radio-group";

import { type PatternSchema, patternSchema } from "../schema2/pattern";

interface Props {
  onSubmit?: (pattern: PatternSchema) => void;
  defaultValue?: PatternSchema;
}

export const PatternSelectForm: React.FC<Props> = ({
  onSubmit,
  defaultValue,
}) => {
  return (
    <Form
      id="pattern-select-form"
      schema={patternSchema}
      defaultValue={defaultValue}
      onSubmit={(ctx, { submission }) => {
        ctx.preventDefault();
        ctx.stopPropagation();
        if (submission?.status === "success") {
          onSubmit?.(submission.value);
          return;
        }
      }}
    >
      <RadioGroup name="pattern" aria-label="event-edit-pattern">
        <Radio value="0">This event</Radio>
        <Radio value="1">This and following events</Radio>
        <Radio value="2">All events</Radio>
      </RadioGroup>
    </Form>
  );
};
