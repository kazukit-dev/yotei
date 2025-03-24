import { useFormMetadata } from "@conform-to/react";

import DatePicker from "~/components/form/date-picker";
import { Form } from "~/components/form/form";
import { Switch } from "~/components/form/switch";
import TextField from "~/components/form/text-field";
import { TimePicker } from "~/components/form/time-picker";
import { UnderlinedInput } from "~/components/ui/textfield";

import {
  type EventEditFormSchema,
  eventEditFormSchema,
  type ValidatedEventEditSchema,
} from "../schema2";

interface Props {
  id: string;
  title?: string;
  // NOTE: 非対称なので、内部で変換する
  defaultValue: EventEditFormSchema;
  onSubmit?: (data: ValidatedEventEditSchema) => void;
  onCancel?: () => void;
}

export const EventEditForm: React.FC<Props> = ({
  id,
  defaultValue,
  onSubmit,
  onCancel: _onCancel,
}) => {
  return (
    <Form
      id={id}
      defaultValue={defaultValue}
      schema={eventEditFormSchema}
      onSubmit={(context, { submission }) => {
        context.stopPropagation();
        context.preventDefault();

        if (submission?.status === "success") {
          onSubmit?.(submission.value);
          return;
        }
      }}
    >
      <div className="flex flex-col gap-20">
        <div className="flex flex-col gap-5">
          <EventFormContainer />
        </div>
      </div>
    </Form>
  );
};

const EventFormContainer = () => {
  return (
    <div className="flex flex-col gap-5">
      <TextField name="title" aria-label="title">
        <UnderlinedInput placeholder="Title" className="text-3xl" />
      </TextField>
      <EventDatePicker />
    </div>
  );
};

const EventDatePicker = () => {
  const form = useFormMetadata<EventEditFormSchema>();
  const fields = form.getFieldset();
  const allDay = fields.is_all_day;
  const start = fields.start.getFieldset();
  const end = fields.end.getFieldset();

  const isValidDateRange = !!fields.start.errors;

  return (
    <div className="flex flex-col gap-2">
      <Switch name="is_all_day">All Day</Switch>

      <div className="flex items-center gap-2">
        <div className="shrink">
          <fieldset>
            <legend className="sr-only">start</legend>
            <div className="flex flex-row gap-1">
              {allDay.value ? (
                <DatePicker
                  name={start.date.name}
                  aria-label="start-date"
                  isInvalid={isValidDateRange}
                  className="w-full"
                />
              ) : (
                <>
                  <DatePicker
                    name={start.date.name}
                    aria-label="start-date"
                    isInvalid={isValidDateRange}
                  />
                  <TimePicker
                    name={start.time.name}
                    aria-label="start-time"
                    isInvalid={isValidDateRange}
                  />
                </>
              )}
            </div>
          </fieldset>
        </div>
        <div>
          <span>to</span>
        </div>
        <div className="shrink">
          <fieldset>
            <legend className="sr-only">End</legend>
            <div className="flex flex-row gap-1">
              {allDay.value ? (
                <DatePicker
                  name={end.date.name}
                  aria-label="end-date"
                  isInvalid={isValidDateRange}
                  className="w-full"
                />
              ) : (
                <>
                  <TimePicker
                    name={end.time.name}
                    aria-label="end-time"
                    isInvalid={isValidDateRange}
                  />
                  <DatePicker
                    name={end.date.name}
                    aria-label="end-date"
                    isInvalid={isValidDateRange}
                    className="w-full"
                  />
                </>
              )}
            </div>
          </fieldset>
        </div>
      </div>
      {fields.start.errors && <p className="text-red-700">{fields.start.errors}</p>}
    </div>
  );
};
