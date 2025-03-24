import { EventCreateForm } from "../event-forms/presentations/event-create-form";
import type { EventCreateSchema } from "../event-forms/schema2/create";
import { Button } from "../ui/button";
import {
  DialogContent,
  DialogFooter,
  DialogOverlay,
  DialogTitle,
} from "../ui/dialog";
import { AnimatePresence, MotionModal, MotionOverlay } from "./animation";

type OnSubmit = (data: EventCreateSchema) => void;

interface Props {
  isOpen: boolean;
  onSubmit?: OnSubmit;
  onOpenChange?: (isOpen: boolean) => void;
}

export const EventCreateDialog: React.FC<Props> = ({
  isOpen,
  onSubmit,
  onOpenChange,
}) => {
  return (
    <AnimatePresence>
      <DialogOverlay isOpen={isOpen} onOpenChange={onOpenChange}>
        <MotionOverlay>
          <DialogContent className="max-w-5xl">
            {({ close }) => (
              <MotionModal>
                <DialogTitle className="text-xl">Add Event</DialogTitle>
                <div className="min-w-[500px] py-4">
                  <EventCreateForm id="event-create-form" onSubmit={onSubmit} />
                </div>
                <DialogFooter className="flex items-center justify-end gap-3">
                  <Button
                    type="button"
                    variant="secondary"
                    onPress={() => {
                      close();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button form="event-create-form" type="submit">
                    Create
                  </Button>
                </DialogFooter>
              </MotionModal>
            )}
          </DialogContent>
        </MotionOverlay>
      </DialogOverlay>
    </AnimatePresence>
  );
};
