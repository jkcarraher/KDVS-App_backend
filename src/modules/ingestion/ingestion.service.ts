import { Injectable, Logger } from "@nestjs/common";
import { Show } from "../../shared/entities/show.entity";
import { Season } from "../../shared/entities/season.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, LessThanOrEqual, MoreThanOrEqual, In } from "typeorm";
import { mergeZShowIntoShowMap } from "./kdvs-api/kdvs-api.helpers";
import { extractZShowPersonaIds } from "./spinitron/spinitron.helper";
import { ShowTimeslot } from "~/shared/entities/show-timeslot.entity";
import { fetchZShowsForSeason } from "./kdvs-api/kdvs-api.client";
import { ShowsService } from "../shows/shows.service";
import { fetchPersonasFromSpinitronIds } from "./spinitron/spinitron.client";
import { PersonasService } from "../personas/personas.service";
import { TimeslotsService } from "../timeslots/timeslots.service";
import { appendZShowTimeslotByShowId, getLocalWeekday } from "../timeslots/timeslots.helper";
import { zScheduleItem } from "./kdvs-api/kdvs-api.schema";
import { DayOfWeek } from "~/shared/types/dotw.enum";
import { TimeslotKey } from "../timeslots/timeslots.types";

@Injectable()
export class IngestionService {
  constructor(
    private readonly showsService: ShowsService,
    private readonly personasService: PersonasService,
    private readonly timeslotService: TimeslotsService,
    @InjectRepository(Season)
    private readonly seasonRepository: Repository<Season>,
  ) {}

  private readonly logger = new Logger(IngestionService.name);

  async getCurrentSeason(): Promise<Season | null> {
    const today = new Date().toISOString().slice(0, 10);
    return this.seasonRepository.findOne({
      where: {
        start_date: LessThanOrEqual(today),
        end_date: MoreThanOrEqual(today),
      },
    });
  }

  recordZShowDOTW(
    showRecords: Map<string, Map<number, number>>, 
    item: zScheduleItem
  ) {
    const showId = item.show_id ? String(item.show_id) : String(item.id);
    const dotw = getLocalWeekday(item.start);
    let showRecord = showRecords.get(showId);

    if (!showRecord) {
      showRecord = new Map<number, number>();
      showRecords.set(showId, showRecord);
    }

    showRecord.set(dotw, (showRecord.get(dotw) ?? 0) + 1);
  }

  async updateDB() {
    // Get the current Season if any
    const season = await this.getCurrentSeason();
    if (!season) {
      this.logger.warn('No current season found for show scraper.');
      return;
    }

    // Get KDVS' zShows
    const zShows = await fetchZShowsForSeason(season)
    
    // Keep a map of Show objects unique by their SpinitronID.
    const uniqueShowsById = new Map<string, Partial<Show>>();
    const showWeekdayFrequency = new Map<string, Map<DayOfWeek, number>>();
    const uniquePersonaIds = new Set<string>();
    const uniqueTimeslots = new Map<TimeslotKey, Partial<ShowTimeslot>[]>();

    for (const zShow of zShows) {
      mergeZShowIntoShowMap(uniqueShowsById, zShow)
      extractZShowPersonaIds(uniquePersonaIds, zShow)
      this.recordZShowDOTW(showWeekdayFrequency, zShow)
    }

    for (const zShow of zShows) {
      appendZShowTimeslotByShowId(uniqueTimeslots, showWeekdayFrequency, zShow, season)
    }

    // Populate Personas Table
    await this.personasService.filterSetOfPersonaIds(uniquePersonaIds)
    const uniquePersonas = await fetchPersonasFromSpinitronIds(Array.from(uniquePersonaIds));
    await this.personasService.createMany(uniquePersonas);

    // Populate Shows Table
    await this.showsService.batchInsertNewShows(Array.from(uniqueShowsById.values()));
    
    // Populate Timeslots Table
    const normalizedTimeslots: Partial<ShowTimeslot>[] = Array.from(
      uniqueTimeslots.values(),
    ).flatMap((slotMap) => Array.from(slotMap.values()));

    await this.timeslotService.replaceSeasonTimeslots(season.id, Array.from(normalizedTimeslots))
  }
}