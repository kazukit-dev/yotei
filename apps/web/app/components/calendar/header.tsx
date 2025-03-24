import dayjs from "dayjs";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  LoaderCircleIcon,
  PlusIcon,
} from "lucide-react";

import { Button } from "~/components/ui/button";
import { Toggle, ToggleButtonGroup } from "~/components/ui/toggle";
import { format } from "~/utils/day";

interface Props {
  date: Date;
  view: "week" | "month";
  isLoading: boolean;
  onChangeDate?: (date: Date) => void;
  onChangeView?: (type: "week" | "month") => void;
  onAddEvent?: () => void;
}

export const Header: React.FC<Props> = ({
  date,
  view = "month",
  isLoading,
  onChangeDate,
  onChangeView,
  onAddEvent,
}) => {
  const handleToday = () => {
    onChangeDate?.(new Date());
  };
  const handleNext = (type: "week" | "month") => () => {
    const nextDate =
      type === "week" ? dayjs(date).add(1, "week") : dayjs(date).add(1, "M");
    onChangeDate?.(nextDate.toDate());
  };
  const handlePrev = (type: "week" | "month") => () => {
    const prevDate =
      type === "week"
        ? dayjs(date).subtract(1, "week")
        : dayjs(date).subtract(1, "M");
    onChangeDate?.(prevDate.toDate());
  };

  const targetDate =
    view === "week" ? format(date, "YYYY/MM/DD") : format(date, "YYYY/MM");

  return (
    <div className="relative flex items-center justify-between">
      <div className="flex items-center justify-start gap-4">
        <Button type="button" variant="outline" onPress={handleToday}>
          Today
        </Button>
        <div className="flex items-center justify-center">
          <button
            type="button"
            className="relative flex size-10 items-center justify-center rounded-full 
                 transition duration-300 hover:bg-gray-400/30"
            onClick={handlePrev(view)}
          >
            <ChevronLeftIcon />
          </button>
          <button
            type="button"
            className="relative flex size-10 items-center justify-center rounded-full 
                 transition duration-300 hover:bg-gray-400/30"
            onClick={handleNext(view)}
          >
            <ChevronRightIcon />
          </button>
        </div>
        <div className="flex items-center gap-3">
          <p className="text-2xl">{targetDate}</p>
          {isLoading && (
            <div>
              <LoaderCircleIcon className="animate-spin" />
            </div>
          )}
        </div>
      </div>

      <div className="absolute left-1/2 -translate-x-1/2">
        <ToggleButtonGroup
          className="h-10 w-64 rounded-lg border border-gray-200 p-0.5"
          disallowEmptySelection
          selectedKeys={[view]}
          onSelectionChange={(key) => {
            const view = Array.from(key.values())[0] as "week" | "month";
            onChangeView?.(view);
          }}
        >
          <Toggle
            className="h-8 w-full border-none data-[selected]:bg-black data-[selected]:text-white"
            variant="outline"
            id="week"
          >
            Week
          </Toggle>
          <Toggle
            className="h-8 w-full border-none data-[selected]:bg-black data-[selected]:text-white"
            variant="outline"
            id="month"
          >
            Month
          </Toggle>
        </ToggleButtonGroup>
      </div>

      <div>
        <Button
          type="button"
          variant="outline"
          onPress={() => {
            onAddEvent?.();
          }}
        >
          <PlusIcon />
        </Button>
      </div>
    </div>
  );
};
