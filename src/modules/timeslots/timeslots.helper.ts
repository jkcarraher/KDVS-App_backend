import { DEFAULT_TIMEZONE } from '~/shared/consts/consts';
import { formatInTimeZone, fromZonedTime } from 'date-fns-tz';

export function formatLocalTime(
  dateString: string,
  timeZone = DEFAULT_TIMEZONE,
): string {
  return formatInTimeZone(new Date(dateString), timeZone, 'HH:mm:ss');
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

export function getWeekIndexFromSeasonStart(seasonStart: string, eventStart: string): number {
  const start = new Date(seasonStart);
  const event = new Date(eventStart);
  const msPerDay = 86_400_000;
  const days = Math.floor((event.getTime() - start.getTime()) / msPerDay);
  return Math.max(0, Math.floor(days / 7));
}

export function combineDateAndTime(date: Date, time: string): Date {
  const fullTime = time.split(':').length === 2 ? `${time}:00` : time;

  const dateString = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: DEFAULT_TIMEZONE,
  }).format(date);

  const localDateTime = `${dateString}T${fullTime}`;

  return fromZonedTime(localDateTime, DEFAULT_TIMEZONE);
}

export function getDateForWeekday(targetWeekday: number): Date {
  const now = new Date();

  const currentWeekday =
    now.getDay() === 0 ? 7 : now.getDay();

  let diff = targetWeekday - currentWeekday;

  if (diff < 0) {
    diff += 7;
  }

  const result = new Date(now);
  result.setDate(now.getDate() + diff);

  return result;
}