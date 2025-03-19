import { useFormMetadata } from "@conform-to/react";
import dayjs from "dayjs";
import { SelectValue } from "react-aria-components";
import DatePicker from "~/components/form/date-picker";
import { Form } from "~/components/form/form";
import Select from "~/components/form/select";
import { Switch } from "~/components/form/switch";
import TextField from "~/components/form/text-field";
import { TimePicker } from "~/components/form/time-picker";
import {} from "~/components/ui/combobox";
import { Label } from "~/components/ui/field";
import {
  SelectItem,
  SelectListBox,
  SelectPopover,
  SelectTrigger,
} from "~/components/ui/select";
import { UnderlinedInput } from "~/components/ui/textfield";
import { type EventCreateSchema, eventCreateSchema } from "../schema2/create";

interface Props {
  id: string;
  onSubmit?: (data: EventCreateSchema) => void;
}
export const EventCreateForm = ({ id, onSubmit }: Props) => {
  const now = dayjs();
  const defaultStart = now;
  const defaultEnd = now.add(10, "m");

  return (
    <Form
      id={id}
      defaultValue={{
        title: "",
        start: {
          date: defaultStart.format("YYYY-MM-DD"),
          time: defaultStart.format("HH:mm"),
        },
        end: {
          date: defaultEnd.format("YYYY-MM-DD"),
          time: defaultEnd.format("HH:mm"),
        },
        is_all_day: false,
        rrule: {
          freq: "none",
        },
      }}
      onSubmit={(context, { submission }) => {
        context.stopPropagation();
        context.preventDefault();
        if (submission?.status === "success") {
          onSubmit?.(submission.value);
          return;
        }
      }}
      schema={eventCreateSchema}
    >
      <EventFormContainer />
    </Form>
  );
};

const EventFormContainer = () => {
  return (
    <div className="flex flex-col gap-4">
      <EventTitleField />
      <EventDatePicker />
      <RepeatSelector />
    </div>
  );
};

const EventTitleField = () => {
  return (
    <TextField name="title" aria-label="event title">
      <UnderlinedInput
        placeholder="Title"
        aria-label="event-title"
        className="text-2xl"
      />
    </TextField>
  );
};

const EventDatePicker = () => {
  const form = useFormMetadata<EventCreateSchema>();
  const fields = form.getFieldset();
  const allDay = fields.is_all_day;
  const start = fields.start.getFieldset();
  const end = fields.end.getFieldset();

  const isValidDateRange = !!fields.start.errors;

  return (
    <div className="flex flex-col gap-2">
      <Switch name="is_all_day">All Day</Switch>

      <div className="flex gap-2 items-center">
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
      {fields.start.errors && (
        <p className="text-red-700">{fields.start.errors}</p>
      )}
    </div>
  );
};

const RepeatSelector = () => {
  const form = useFormMetadata<EventCreateSchema>();
  const fields = form.getFieldset();
  const start = fields.start.getFieldset();
  const rrule = fields.rrule.getFieldset();

  const defaultUntil = dayjs(start.date.value).add(1, "M").format("YYYY-MM-DD");

  return (
    <div className="flex flex-col gap-1">
      <div>
        <Label>Repeat</Label>
        <Select name={rrule.freq.name} aria-label="repeat setting">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectPopover>
            <SelectListBox>
              <SelectItem id="none">Does't repeat</SelectItem>
              <SelectItem id="daily">Daily</SelectItem>
              <SelectItem id="weekly">Weekly</SelectItem>
              <SelectItem id="monthly">Monthly</SelectItem>
            </SelectListBox>
          </SelectPopover>
        </Select>
      </div>
      {rrule.freq.value !== "none" && (
        <div>
          <Label>Until</Label>
          <DatePicker
            name={rrule.until.name}
            minValue={start.date.value}
            aria-label="until"
            value={defaultUntil}
            className="w-1/2"
          />
        </div>
      )}
    </div>
  );
};
