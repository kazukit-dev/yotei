import type { Event, EventDetail } from "~/models/event";
import type { EventDetailDto, EventDto } from "./type";

export const toDomain = (dto: EventDto): Event => {
  if (!dto.is_recurring) {
    return {
      id: dto.id,
      title: dto.title,
      start: new Date(dto.start),
      end: new Date(dto.end),
      is_all_day: dto.is_all_day,
      is_recurring: false,
    };
  }

  if (!dto.rrule) {
    throw new Error("RRule is undefined.");
  }

  return {
    id: dto.id,
    title: dto.title,
    start: new Date(dto.start),
    end: new Date(dto.end),
    is_all_day: dto.is_all_day,
    is_recurring: true,
    rrule: {
      dtstart: new Date(dto.rrule.dtstart),
      until: new Date(dto.rrule.until),
      freq: dto.rrule.freq,
    },
  };
};

export const toEventDetailDomain = (dto: EventDetailDto): EventDetail => {
  if (!dto.is_recurring) {
    return {
      id: dto.id,
      title: dto.title,
      start: new Date(dto.start),
      end: new Date(dto.end),
      is_all_day: dto.is_all_day,
      is_recurring: false,
    };
  }

  if (!dto.rrule) {
    throw new Error("RRule is undefined.");
  }

  return {
    id: dto.id,
    title: dto.title,
    start: new Date(dto.start),
    end: new Date(dto.end),
    is_all_day: dto.is_all_day,
    is_recurring: true,
    rrule: {
      dtstart: new Date(dto.rrule.dtstart),
      until: new Date(dto.rrule.until),
      freq: dto.rrule.freq,
    },
  };
};
