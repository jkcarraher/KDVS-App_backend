import { zScheduleItem } from '../shows/scraper/kdvs-api/kdvs-api.schema';
import { ShowTimeslot } from '../entities/show-timeslot.entity';
import { DEFAULT_TIMEZONE } from '~/consts/consts';
import { Season } from '~/entities/season.entity';
import { Persona } from '~/entities/persona.entity';
import { Show } from '~/entities/show.entity';

function formatLocalTime(dateString: string, timeZone = DEFAULT_TIMEZONE): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}

function getLocalWeekday(dateString: string, timeZone = DEFAULT_TIMEZONE): number {
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

function buildTimeslotKey(weekday: number, startTime: string): string {
  return `${weekday}-${startTime}`;
}

export function appendZShowTimeslotByShowName(
  nestedTimeslots: Map<string, Map<string, Partial<ShowTimeslot>>>,
  item: zScheduleItem,
  season: Season,
): void {
  if (item.one_off) {
    return;
  }
  
  const showName = item.title?.trim();
  if (!showName) return;

  const timeZone = item.timezone || DEFAULT_TIMEZONE;
  const weekday = getLocalWeekday(item.start, timeZone);
  const startTime = formatLocalTime(item.start, timeZone);
  const endTime = formatLocalTime(item.end, timeZone);
  const slotKey = buildTimeslotKey(weekday, startTime);
  const showId = item.show_id ? item.show_id : item.id;
  const personaLinks = [
    ...(item._links?.personas ?? []),
    ...(item._links?.persona ?? []),
  ];
  
  const personaIds = personaLinks
    ?.map((link) => String(link?.href ?? '').trim().match(/\/personas\/(\d+)(?:\/?$|\?)/))
    .filter(Boolean)
    .map((match) => Number(match![1]))
    .filter((id) => Number.isFinite(id) && id > 0) ?? [];
  
  let timeSlotMap = nestedTimeslots.get(slotKey);
  if (!timeSlotMap) {
    timeSlotMap = new Map<string, Partial<ShowTimeslot>>();
    nestedTimeslots.set(slotKey, timeSlotMap);
  }

  if (timeSlotMap.has(showName)) {
    return;
  }

  // Updating Map Entries
  const recurrenceIntervalWeeks = Math.max(1, timeSlotMap.size + 1);

  const weekIndex = getWeekIndexFromSeasonStart(season.start_date, item.start);
  const recurrenceOffset = weekIndex % recurrenceIntervalWeeks;
  const anchorDate = getAnchorDate(season.start_date, item.start, recurrenceIntervalWeeks);

  for (const [existingShowName, existingTimeslot] of timeSlotMap.entries()) {
    if (!existingTimeslot) continue;
    const existingEventStart = existingTimeslot.anchor_date!
    const existingOffset = getWeekIndexFromSeasonStart(season.start_date, existingEventStart) % recurrenceIntervalWeeks;
    existingTimeslot.recurrence_interval_weeks = recurrenceIntervalWeeks;
    existingTimeslot.recurrence_offset = existingOffset;
  }

  timeSlotMap.set(showName, {
    season: {id: season.id } as Season,
    show: { id: showId } as Show,
    weekday,
    start_time: startTime,
    end_time: endTime,
    recurrence_interval_weeks: recurrenceIntervalWeeks,
    recurrence_offset: recurrenceOffset,
    timezone: timeZone,
    anchor_date: item.start.slice(0, 10),
    personas: personaIds.map((id) => ({ id } as Persona)),
  });
}