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
  const showsById = new Map<string, Partial<Show>>();

  for (const item of items) {
    const showId = String(item.id);
    const normalizedName = item.title?.trim() ?? '';
    if (!showsById.has(showId)) {
      showsById.set(showId, {
        name: normalizedName,
        catagory: item.category?.trim() ?? '',
        spinitron_url: item._links.self.href,
        image_url: item.image ?? '',
        spinitron_ids: [showId],
      });
    }
  }

  return Array.from(showsById.values());
}