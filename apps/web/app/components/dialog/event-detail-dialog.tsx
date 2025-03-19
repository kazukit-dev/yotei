import dayjs from "dayjs";
import { ClockIcon, PencilIcon, Trash2Icon, XIcon } from "lucide-react";
import type { PropsWithChildren } from "react";
import type { EventDetail } from "~/models/event";
import { format } from "~/utils/day";
import { DialogContent, DialogOverlay, DialogTitle } from "../ui/dialog";
import { AnimatePresence, MotionModal, MotionOverlay } from "./animation";

interface Props {
  event: EventDetail;
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  onEdit?: (id: string, targetDate: Date) => void;
  onDelete?: (id: string, targetDate: Date) => void;
}

const IconWrapper: React.FC<PropsWithChildren<{ onClick?: () => void }>> = ({
  children,
  onClick,
}) => {
  return (
    <button
      type="button"
      className="p-3 hover:cursor-pointer rounded-full hover:bg-gray-500/20 transition duration-200"
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export const EventDetailDialog: React.FC<Props> = ({
  event,
  isOpen,
  onOpenChange,
  onDelete,
  onEdit,
}) => {
  return (
    <AnimatePresence>
      <DialogOverlay isOpen={isOpen} onOpenChange={onOpenChange}>
        <MotionOverlay>
          <DialogContent
            className="w-96 pt-2 pl-5 pr-2 pb-4"
            closeButton={false}
          >
            {({ close }) => (
              <MotionModal>
                <div className="flex justify-end items-center gap-1">
                  <div>
                    <IconWrapper
                      onClick={() => {
                        onEdit?.(event.id, event.start);
                      }}
                    >
                      <PencilIcon size={16} />
                    </IconWrapper>
                    <IconWrapper
                      onClick={() => {
                        onDelete?.(event.id, event.start);
                      }}
                    >
                      <Trash2Icon size={16} />
                    </IconWrapper>
                  </div>
                  <IconWrapper
                    onClick={() => {
                      close();
                    }}
                  >
                    <XIcon size={16} />
                  </IconWrapper>
                </div>
                <DialogTitle className="text-2xl">{event.title}</DialogTitle>
                <div className="py-4">
                  <DetailContent event={event} />
                </div>
              </MotionModal>
            )}
          </DialogContent>
        </MotionOverlay>
      </DialogOverlay>
    </AnimatePresence>
  );
};

const DetailContent: React.FC<{ event: EventDetail }> = ({ event }) => {
  const isSameDate = dayjs(event.start).isSame(event.end, "M");

  const endDateFormat = isSameDate ? "HH:mm" : "YYYY/MM/DD HH:mm";
  return (
    <div>
      <div className="flex gap-2 items-center">
        <ClockIcon size={20} />
        <div className="flex gap-1">
          <span>{format(event.start, "YYYY/MM/DD HH:mm")}</span>
          <span>~</span>
          <span>{format(event.end, endDateFormat)}</span>
        </div>
      </div>
    </div>
  );
};
