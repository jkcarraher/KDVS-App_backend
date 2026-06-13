import { Injectable, Logger } from "@nestjs/common";
import { Show } from "../../shared/entities/show.entity";
import { extractZShowPersonaIds } from "./spinitron/spinitron.helper";
import { ShowTimeslot } from "~/shared/entities/show-timeslot.entity";
import { fetchZShowsForSeason } from "./kdvs-api/kdvs-api.client";
import { ShowsService } from "../shows/shows.service";
import { fetchPersonasFromSpinitronIds } from "./spinitron/spinitron.client";
import { PersonasService } from "../personas/personas.service";
import { TimeslotsService } from "../timeslots/timeslots.service";
import { DayOfWeek } from "~/shared/types/dotw.enum";
import { TimeslotKey } from "../timeslots/timeslots.types";
import { SeasonsService } from "../seasons/seasons.service";
import { appendZShowTimeslotByShowId, mergeZShowIntoShowMap, recordZShowDOTW } from "./ingestion.helper";
import { ImageColorService } from "../image_color/image-color.service";

@Injectable()
export class IngestionService {
  constructor(
    private readonly showsService: ShowsService,
    private readonly seasonsService: SeasonsService,
    private readonly personasService: PersonasService,
    private readonly timeslotService: TimeslotsService,
    private readonly imageColorService: ImageColorService,
  ) {}

  private readonly logger = new Logger(IngestionService.name);

  async updateDB() {
    // Get the current Season if any
    const season = await this.seasonsService.getCurrentSeason();
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
      recordZShowDOTW(showWeekdayFrequency, zShow)
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