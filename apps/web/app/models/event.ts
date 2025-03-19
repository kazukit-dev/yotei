export const OPERATION_PATTERN = {
  this: 0,
  future: 1,
  all: 2,
} as const;

export type OperationPattern =
  (typeof OPERATION_PATTERN)[keyof typeof OPERATION_PATTERN];

export const FREQUENCY = {
  yearly: 0,
  monthly: 1,
  weekly: 2,
  daily: 3,
} as const;

export type Frequency = (typeof FREQUENCY)[keyof typeof FREQUENCY];

export type Event = SingleEvent | RecurringEvent;

interface _Event {
  id: string;
  title: string;
  start: Date;
  end: Date;
  is_recurring: boolean;
  is_all_day: boolean;
}

interface RecurringEvent extends _Event {
  is_recurring: true;
  rrule: {
    dtstart: Date;
    until: Date;
    freq: Frequency;
  };
}

interface SingleEvent extends _Event {
  is_recurring: false;
}

interface _EventDetail {
  id: string;
  title: string;
  start: Date;
  end: Date;
  is_recurring: boolean;
  is_all_day: boolean;
}
interface RecurringEventDetail extends _EventDetail {
  is_recurring: true;
  rrule: {
    dtstart: Date;
    until: Date;
    freq: 0 | 1 | 2 | 3;
  };
}
interface SingleEventDetail extends _EventDetail {
  is_recurring: false;
}

export type EventDetail = RecurringEventDetail | SingleEventDetail;
