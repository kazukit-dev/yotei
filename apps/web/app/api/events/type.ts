import type { OperationPattern } from "~/models/event";

export type CreateEventInput =
  | {
      title: string;
      start: string;
      end: string;
      is_recurring: false;
    }
  | {
      title: string;
      start: string;
      end: string;
      is_recurring: true;
      rrule: {
        freq: 0 | 1 | 2 | 3;
        until: string;
      };
    };

export type UpdateEventInput = {
  title: string;
  start: string;
  end: string;
  is_all_day: boolean;
  target_date: string;
  pattern: OperationPattern;
};

export interface EventDto {
  id: string;
  title: string;
  start: string;
  end: string;
  is_all_day: boolean;
  is_recurring: boolean;
  rrule?: {
    freq: 0 | 1 | 2 | 3;
    until: string;
    dtstart: string;
  };
}

export interface EventDetailDto {
  id: string;
  title: string;
  start: string;
  end: string;
  is_all_day: boolean;
  is_recurring: boolean;
  rrule?: {
    freq: 0 | 1 | 2 | 3;
    until: string;
    dtstart: string;
  };
  version: number;
}
