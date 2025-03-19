import { PencilIcon, Trash2Icon, XIcon } from "lucide-react";
import { type ComponentProps, useContext } from "react";
import { Heading, OverlayTriggerStateContext } from "react-aria-components";
import { Button } from "../ui/button";
import { DialogContent, DialogOverlay, DialogTrigger } from "../ui/dialog";

type PopoverProps = Omit<ComponentProps<typeof DialogOverlay>, "children">;

type Props = PopoverProps & {
  popoverStyle?: Record<string, unknown>;
  event?: {
    id: string;
    title: string;
    start: Date;
    end: Date;
    is_all_day: boolean;
  };
};

export const EventDetailPopover: React.FC<Props> = ({
  event,
  popoverStyle,
  ...props
}) => {
  const i = useContext(OverlayTriggerStateContext);
  i.return(
    <DialogTrigger>
      <Button className="hidden" />
      <DialogOverlay {...props} className="bg-black/30">
        <DialogContent
          closeButton={false}
          className="min-w-96 min-h-32 pl-6 pr-2 pt-2 pb-3 "
          style={popoverStyle}
          side="right"
        >
          <div className="flex gap-2 justify-between items-center">
            <Heading className="bold text-xl">{event?.title}</Heading>

            <div className="flex justify-end items-center">
              <PencilIcon className="size-5 m-3 cursor-pointer" />
              <Trash2Icon className="size-5 m-3 cursor-pointer" />
              <XIcon className="size-5 m-3 cursor-pointer" />
            </div>
          </div>
        </DialogContent>
      </DialogOverlay>
    </DialogTrigger>,
  );
};
