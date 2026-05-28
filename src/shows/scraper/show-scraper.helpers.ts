import { Show } from '../../entities/show.entity';
import { scheduleResponseSchema, zScheduleItem, zScheduleResponse } from './show-scraper.schema';

export async function fetchSchedulePage(
  offset: number,
): Promise<zScheduleResponse> {
  const url = `https://kdvs.org/api/spinitron/schedule?offset=${offset}`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Failed to fetch schedule offset=${offset}: ${res.statusText}`);
  }

  const json = await res.json();
  return scheduleResponseSchema.parse(json);
}

export async function fetchSchedulePages(offsets: number[] = [0]): Promise<zScheduleResponse[]> {
  return Promise.all(offsets.map(fetchSchedulePage));
}

export function flattenScheduleResponses(responses: zScheduleResponse[]): zScheduleItem[] {
  return responses.flatMap((response) => [
    ...(response.future ?? []),
    ...(response.past ?? []),
  ]);
}

export function mapScheduleItemsToUniqueShows(
  items: zScheduleItem[],
): Partial<Show>[] {
  const showsById = new Map<number, Partial<Show>>();

  for (const item of items) {
    const showId = (item as any).show_id ?? item.id;
    if (!showId) continue;

    if (!showsById.has(showId)) {
      showsById.set(showId, {
        spinitron_show_id: showId,
        name: item.title,
        catagory: item.category,
        spinitron_url: item._links.self.href,
        image_url: item.image ?? '',
      });
    }
  }

  return Array.from(showsById.values());
}