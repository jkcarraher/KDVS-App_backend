import { Show } from "~/shared/entities/show.entity";
import { formatLocalTime, getLocalWeekday, getWeekIndexFromSeasonStart } from "../timeslots/timeslots.helper";
import { zScheduleItem } from "./kdvs-api/kdvs-api.schema";
import { buildTimeslotKey, TimeslotKey } from "../timeslots/timeslots.types";
import { ShowTimeslot } from "~/shared/entities/show-timeslot.entity";
import { DayOfWeek } from "~/shared/types/dotw.enum";
import { Season } from "~/shared/entities/season.entity";
import { Persona } from "~/shared/entities/persona.entity";
import { Logger } from "@nestjs/common";

export function zShowToTimeslot(
  season: Season,
  item: zScheduleItem
): Partial<ShowTimeslot> {
  const showId = item.show_id ? String(item.show_id) : String(item.id);
  const weekday = getLocalWeekday(item.start, item.timezone);
  const startTime = formatLocalTime(item.start, item.timezone);
  const endTime = formatLocalTime(item.end, item.timezone);
  const personaLinks = [
    ...(item._links?.personas ?? []),
    ...(item._links?.persona ?? []),
  ];
  const personaIds = personaLinks
    ?.map((link) => String(link?.href ?? '').trim().match(/\/personas\/(\d+)(?:\/?$|\?)/))
    .filter(Boolean)
    .map((match) => match![1])

  return {
    season: {id: season.id } as Season,
    show: { id: showId } as Show,
    weekday,
    start_time: startTime,
    end_time: endTime,
    timezone: item.timezone,
    anchor_date: item.start.slice(0, 10),
    personas: personaIds.map((id) => ({ id } as Persona)),
  }
}

export function recordZShowDOTW(
  showRecords: Map<string, Map<number, number>>, 
  item: zScheduleItem
) {
  const showId = item.show_id ? String(item.show_id) : String(item.id);
  const dotw = getLocalWeekday(item.start);
  let showRecord = showRecords.get(showId);

  if (!showRecord) {
    showRecord = new Map<number, number>();
    showRecords.set(showId, showRecord);
  }

  showRecord.set(dotw, (showRecord.get(dotw) ?? 0) + 1);
}

export function mergeZShowIntoShowMap(
  showsById: Map<string, Partial<Show>>,
  item: zScheduleItem,
): void {
  const showId = item.show_id ? String(item.show_id) : String(item.id);
  
  const existing = showsById.get(showId);

  if (!existing) {
    showsById.set(showId, {
      id: showId,
      name: item.title,
      category: item.category?.trim() ?? '',
      image_url: item.image ?? '',
    });
  }
}

export function appendZShowTimeslotByShowId(
  nestedTimeslots: Map<TimeslotKey, Partial<ShowTimeslot>[]>,
  showDOTWRecords: Map<string, Map<DayOfWeek, number>>,
  item: zScheduleItem,
  season: Season,
): void {
  const timeslot = zShowToTimeslot(season, item)

  const slotKey = buildTimeslotKey( timeslot.weekday! , timeslot.start_time!);
  
  let timeSlotArr = nestedTimeslots.get(slotKey);
  if (!timeSlotArr) {
    timeSlotArr = [];
    nestedTimeslots.set(slotKey, timeSlotArr);
  }

  // zShow has already been recorded to be in this Timeslot
  if (timeSlotArr.some(existingTimeslot => existingTimeslot.show?.id === timeslot.show?.id!)) {
    return;
  }

  // zShow on this DOTW occurs less than 2 times
  const weekdayMap = showDOTWRecords.get(timeslot.show?.id!);
  if ((weekdayMap!.get(timeslot.weekday!) ?? 0) <= 2) {
    return;
  }

  // Updating Map Entries
  const recurrenceIntervalWeeks = Math.max(1, timeSlotArr.length + 1);

  const weekIndex = getWeekIndexFromSeasonStart(season.start_date, item.start);
  const recurrenceOffset = weekIndex % recurrenceIntervalWeeks;

  for (const existingTimeslot of timeSlotArr) {
    if (!existingTimeslot) continue;
    const existingEventStart = existingTimeslot.anchor_date!
    const existingOffset = getWeekIndexFromSeasonStart(season.start_date, existingEventStart) % recurrenceIntervalWeeks;
    existingTimeslot.recurrence_interval_weeks = recurrenceIntervalWeeks;
    existingTimeslot.recurrence_offset = existingOffset;
  }

  timeSlotArr.push({
    season: timeslot.season!,
    show: timeslot.show!,
    weekday: timeslot.weekday!,
    start_time: timeslot.start_time!,
    end_time: timeslot.end_time!,
    recurrence_interval_weeks: recurrenceIntervalWeeks,
    recurrence_offset: recurrenceOffset,
    timezone: timeslot.timezone!,
    anchor_date: item.start.slice(0, 10),
    personas: timeslot.personas!,
  });
}