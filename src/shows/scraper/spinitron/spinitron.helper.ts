import { zScheduleItem } from "../kdvs-api/kdvs-api.schema";

export function extractZShowPersonaIds(personaIds: Set<number>, item: zScheduleItem): void {
  const personaLinks = item._links?.personas;
  if (!Array.isArray(personaLinks)) {
    return;
  }

  for (const link of personaLinks) {
    const href = String(link?.href ?? '').trim()
    const match = href.match(/\/personas\/(\d+)(?:\/?$|\?)/);
    if (match) {
      personaIds.add(Number(match[1]));
    }
  }
  return
}