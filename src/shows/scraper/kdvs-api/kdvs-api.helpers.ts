import { Season } from "~/entities/season.entity";
import { zScheduleItem } from "./kdvs-api.schema";
import { Show } from "~/entities/show.entity";

export function getScheduleOffsetsForSeason(season: Season): number[] {
  const todayInPst = getPstDayNumber(new Date());
  const startDay = getDayNumberFromDateString(season.start_date);
  const endDay = getDayNumberFromDateString(season.end_date);

  const startOffset = startDay - todayInPst;
  const endOffset = endDay - todayInPst;

  const offsets: number[] = [];
  for (let offset = startOffset; offset <= endOffset; offset += 1) {
    offsets.push(offset);
  }
  return offsets;
}

export function getPstDayNumber(date: Date): number {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const [{ value: month }, , { value: day }, , { value: year }] = formatter.formatToParts(date);
  return getDayNumberFromDateString(`${year}-${month}-${day}`);
}

export function getDayNumberFromDateString(dateString: string): number {
  const [year, month, day] = dateString.split('-').map(Number);
  return Math.floor(Date.UTC(year, month - 1, day) / 86_400_000);
}

export function mergeZShowIntoShowMap(
  showsById: Map<string, Partial<Show>>,
  item: zScheduleItem,
): void {
  const showId = item.show_id ? item.show_id : item.id;
  
  const existing = showsById.get(showId);

  if (!existing) {
    showsById.set(showId, {
      id: showId,
      name: item.title,
      catagory: item.category?.trim() ?? '',
      image_url: item.image ?? '',
    });
  }
}