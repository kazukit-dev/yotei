import {
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
} from "~/components/ui/dialog";

import { createCallable } from "react-call";
import type { OperationPattern } from "~/models/event";
import { PatternSelectForm } from "../event-forms/presentations/pattern-select-form";
import { Button } from "../ui/button";

type DialogResponse = OperationPattern | null;

export const PatternSelectDialog = createCallable<void, DialogResponse>(
  ({ call }) => (
    <DialogOverlay
      isOpen
      onOpenChange={() => {
        call.end(null);
      }}
    >
      <DialogContent className="min-w-96">
        <DialogHeader>
          <DialogTitle>Edit Recurring Event</DialogTitle>
        </DialogHeader>
        <div className="py-5">
          <PatternSelectForm
            defaultValue={{ pattern: "0" }}
            onSubmit={(value) => {
              const pattern = Number(value.pattern) as OperationPattern;
              call.end(pattern);
            }}
          />
        </div>
        <DialogFooter className="flex justify-end">
          <Button
            className="w-28"
            onPress={() => {
              call.end(null);
            }}
            variant="secondary"
          >
            Cancel
          </Button>
          <Button
            className="w-28"
            form="pattern-select-form"
            variant="default"
            type="submit"
          >
            OK
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogOverlay>
  ),
);
