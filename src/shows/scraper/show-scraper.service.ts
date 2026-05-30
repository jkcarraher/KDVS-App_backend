import { Injectable, Logger } from "@nestjs/common";
import { Show } from "../../entities/show.entity";
import { Season } from "../../entities/season.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, LessThanOrEqual, MoreThanOrEqual } from "typeorm";
import { fetchSchedulePages, flattenScheduleResponses, mapScheduleItemsToUniqueShows } from "./show-scraper.helpers";

@Injectable()
export class ShowScraperService {
  constructor(
    @InjectRepository(Show)
    private readonly showRepository: Repository<Show>,
    @InjectRepository(Season)
    private readonly seasonRepository: Repository<Season>,
  ) {}

  private readonly logger = new Logger(ShowScraperService.name);

  async getCurrentSeason(): Promise<Season | null> {
    const today = new Date().toISOString().slice(0, 10);
    return this.seasonRepository.findOne({
      where: {
        start_date: LessThanOrEqual(today),
        end_date: MoreThanOrEqual(today),
      },
    });
  }

  private getScheduleOffsetsForSeason(season: Season): number[] {
    const todayInPst = this.getPstDayNumber(new Date());
    const startDay = this.getDayNumberFromDateString(season.start_date);
    const endDay = this.getDayNumberFromDateString(season.end_date);

    const startOffset = startDay - todayInPst;
    const endOffset = endDay - todayInPst;

    const offsets: number[] = [];
    for (let offset = startOffset; offset <= endOffset; offset += 1) {
      offsets.push(offset);
    }
    return offsets;
  }

  private getPstDayNumber(date: Date): number {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Los_Angeles',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    const [{ value: month }, , { value: day }, , { value: year }] = formatter.formatToParts(date);
    return this.getDayNumberFromDateString(`${year}-${month}-${day}`);
  }

  private getDayNumberFromDateString(dateString: string): number {
    const [year, month, day] = dateString.split('-').map(Number);
    return Math.floor(Date.UTC(year, month - 1, day) / 86_400_000);
  }

  async fetchShowsAndUpdateDB(season: Season) {

    this.logger.log(`Fetching shows for season ${season.name} (${season.start_date} -> ${season.end_date})`);

    const offsets = this.getScheduleOffsetsForSeason(season);
    this.logger.log(`Fetching schedule pages for offsets: ${offsets[0]}..${offsets[offsets.length - 1]}`);

    const zShows = flattenScheduleResponses(await fetchSchedulePages(offsets));

    // This should give us a list of API Show objects from which we can build a list of Show Objects to insert into the DB
    const uniqueShows = mapScheduleItemsToUniqueShows(zShows);

    const mergedShowsByName = new Map<string, Partial<Show>>();

    for (const incoming of uniqueShows) {
      const incomingName = incoming.name?.trim() ?? '';
      if (!incomingName) continue;
      const key = incomingName.toLowerCase();
      const existing = mergedShowsByName.get(key);

      if (existing) {
        const ids = new Set(existing.spinitron_ids ?? []);
        for (const incomingId of incoming.spinitron_ids ?? []) {
          if (incomingId) ids.add(incomingId);
        }
        existing.spinitron_ids = Array.from(ids);
        if (!existing.spinitron_url && incoming.spinitron_url) {
          existing.spinitron_url = incoming.spinitron_url;
        }
        if (!existing.image_url && incoming.image_url) {
          existing.image_url = incoming.image_url;
        }
      } else {
        mergedShowsByName.set(key, {
          ...incoming,
          name: incomingName,
          spinitron_ids: Array.from(new Set(incoming.spinitron_ids ?? [])),
        });
      }
    }

    const mergedShows = Array.from(mergedShowsByName.values());
    const names = mergedShows
      .map((show) => show.name?.trim().toLowerCase() ?? '')
      .filter((name) => name !== '');

    if (names.length === 0) {
      return;
    }

    const existingShows = await this.showRepository.createQueryBuilder('show')
      .where('LOWER(TRIM(show.name)) IN (:...names)', { names })
      .select(['show.id', 'show.name', 'show.spinitron_ids', 'show.spinitron_url', 'show.image_url'])
      .getMany();

    const existingByName = new Map(
      existingShows.map((show) => [show.name?.trim().toLowerCase() ?? '', show]),
    );
    const updates: Show[] = [];
    const newShows: Partial<Show>[] = [];

    for (const incoming of mergedShows) {
      const incomingName = incoming.name?.trim().toLowerCase() ?? '';
      const existing = incomingName ? existingByName.get(incomingName) : undefined;

      if (existing) {
        const idsToAppend = (incoming.spinitron_ids ?? []).filter(
          (incomingId) => incomingId && !((existing.spinitron_ids ?? []).includes(incomingId)),
        );
        if (idsToAppend.length > 0) {
          existing.spinitron_ids = [...(existing.spinitron_ids ?? []), ...idsToAppend];
          updates.push(existing);
        }
      } else {
        newShows.push(incoming);
      }
    }

    if (newShows.length === 0 && updates.length === 0) {
      return;
    }

    await this.showRepository.save([...updates, ...newShows]);
  }
}