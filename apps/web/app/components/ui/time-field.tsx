import type { ComponentProps } from "react";
import {
  Combobox,
  ComboboxInput,
  ComboboxItem,
  ComboboxListBox,
  ComboboxPopover,
} from "./combobox";

import { ChevronsUpDown } from "lucide-react";
import { Button } from "./button";
import { FieldGroup } from "./field";
import {} from "./select";

interface Props extends ComponentProps<typeof Combobox> {}

const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const minutes = ["00", "15", "30", "45"] as const;
const times = hours.flatMap((hour) =>
  minutes.map((minute) => `${hour}:${minute}`),
);
export const TimePicker: React.FC<Props> = (props) => {
  return (
    <Combobox {...props}>
      <div className="flex items-center">
        <FieldGroup className="p-0">
          <ComboboxInput type="time" className={"no-calendar-icon"} />
          <Button variant="ghost" size="icon" className="mr-1 size-6 p-1">
            <ChevronsUpDown aria-hidden="true" className="size-4 opacity-50" />
          </Button>
        </FieldGroup>
      </div>

      <ComboboxPopover shouldFlip={false} placement="bottom">
        <ComboboxListBox className="max-h-40">
          {times.map((time) => (
            <ComboboxItem key={time} id={time}>
              {time}
            </ComboboxItem>
          ))}
        </ComboboxListBox>
      </ComboboxPopover>
    </Combobox>
  );
};
