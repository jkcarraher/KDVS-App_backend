import { zScheduleItem } from '../ingestion/kdvs-api/kdvs-api.schema';
import { ShowTimeslot } from '~/shared/entities/show-timeslot.entity';
import { DEFAULT_TIMEZONE } from '~/shared/consts/consts';
import { Season } from '~/shared/entities/season.entity';
import { Persona } from '~/shared/entities/persona.entity';
import { Show } from '~/shared/entities/show.entity';
import { buildTimeslotKey, TimeslotKey } from './timeslots.types';
import { DayOfWeek } from '~/shared/types/dotw.enum';

function formatLocalTime(dateString: string, timeZone = DEFAULT_TIMEZONE): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}

export function getLocalWeekday(dateString: string, timeZone = DEFAULT_TIMEZONE): number {
  const date = new Date(dateString);
  const day = new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'short',
  }).format(date);

  switch (day.toLowerCase()) {
    case 'mon': return 1;
    case 'tue': return 2;
    case 'wed': return 3;
    case 'thu': return 4;
    case 'fri': return 5;
    case 'sat': return 6;
    case 'sun': return 7;
    default: return 0;
  }
}

function getWeekIndexFromSeasonStart(seasonStart: string, eventStart: string): number {
  const start = new Date(seasonStart);
  const event = new Date(eventStart);
  const msPerDay = 86_400_000;
  const days = Math.floor((event.getTime() - start.getTime()) / msPerDay);
  return Math.max(0, Math.floor(days / 7));
}

function getAnchorDate(seasonStart: string, eventStart: string, interval: number): Date {
  const event = new Date(eventStart);
  const weekIndex = getWeekIndexFromSeasonStart(seasonStart, eventStart);
  const offset = weekIndex % interval;
  const anchorWeeksBack = weekIndex - offset;
  return new Date(event.getTime() - anchorWeeksBack * 7 * 86_400_000);
}

function getKeyOfMaxValue(map: Map<number, number>): number | undefined {
  let maxKey: number | undefined;
  let maxValue = -Infinity;

  for (const [key, value] of map) {
    if (value > maxValue) {
      maxValue = value;
      maxKey = key;
    }
  }

  return maxKey;
}

export function appendZShowTimeslotByShowId(
  nestedTimeslots: Map<TimeslotKey, Partial<ShowTimeslot>[]>,
  showDOTWRecords: Map<string, Map<DayOfWeek, number>>,
  item: zScheduleItem,
  season: Season,
): void {
  
  if (item.one_off) {
    return;
  }
  const showId = item.show_id ? String(item.show_id) : String(item.id);
  const weekday = getKeyOfMaxValue(showDOTWRecords.get(showId)!)!;
  const recordWeekday = getLocalWeekday(item.start, item.timezone)

  if (weekday != recordWeekday) return;
  
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

  const slotKey = buildTimeslotKey(weekday, startTime);
  
  let timeSlotArr = nestedTimeslots.get(slotKey);
  if (!timeSlotArr) {
    timeSlotArr = [];
    nestedTimeslots.set(slotKey, timeSlotArr);
  }
  
  if (timeSlotArr.some(slot => slot.show?.id === showId)) {
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
    season: {id: season.id } as Season,
    show: { id: showId } as Show,
    weekday,
    start_time: startTime,
    end_time: endTime,
    recurrence_interval_weeks: recurrenceIntervalWeeks,
    recurrence_offset: recurrenceOffset,
    timezone: item.timezone,
    anchor_date: item.start.slice(0, 10),
    personas: personaIds.map((id) => ({ id } as Persona)),
  });
}

export function combineDateAndTime(date: Date, time: string): Date {
  const [hours, minutes, seconds] = time.split(':').map(Number);

  const result = new Date(date);
  result.setHours(hours, minutes, seconds || 0, 0);

  return result;
}

export function getDateForWeekday(targetWeekday: number): Date {
  const now = new Date();
  const result = new Date(now);

  const diff = targetWeekday - now.getDay();

  result.setDate(now.getDate() + diff);

  return result;
}