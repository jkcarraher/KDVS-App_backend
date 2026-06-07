import { DayOfWeek } from "~/shared/types/dotw.enum";

// e.g. Shows starting Monday at 1:30 PM would be 1-13:30
export type TimeslotKey = `${DayOfWeek}-${string}`

// creates a TimeslotKey
export function buildTimeslotKey(weekday: DayOfWeek, startTime: string): TimeslotKey {
  return `${weekday}-${startTime}`;
}