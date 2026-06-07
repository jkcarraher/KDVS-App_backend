import { Season } from "~/shared/entities/season.entity";
import { scheduleResponseSchema, zScheduleItem, zScheduleResponse } from "./kdvs-api.schema";
import { getScheduleOffsetsForSeason } from "./kdvs-api.helpers";

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

export async function fetchZShowsForSeason(season: Season): Promise<zScheduleItem[]> {
  const offsets = getScheduleOffsetsForSeason(season);
  const zShows = flattenScheduleResponses(await fetchSchedulePages(offsets));
  
  return zShows
}
