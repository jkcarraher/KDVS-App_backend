import { Injectable, Logger } from "@nestjs/common";
import { Show } from "../../entities/show.entity";
import { Season } from "../../entities/season.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, LessThanOrEqual, MoreThanOrEqual, In } from "typeorm";
import { mergeZShowIntoShowMap } from "./kdvs-api/kdvs-api.helpers";
import { extractZShowPersonaIds } from "./spinitron/spinitron.helper";
import { appendZShowTimeslotByShowName } from "~/timeslots/timeslots.helper";
import { ShowTimeslot } from "~/entities/show-timeslot.entity";
import { fetchZShowsForSeason } from "./kdvs-api/kdvs-api.client";
import { ShowsService } from "../shows.service";
import { PersonasService } from "~/personas/personas.service";

@Injectable()
export class ShowScraperService {
  constructor(
    private readonly showsService: ShowsService,
    private readonly personasService: PersonasService,
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
    const uniqueShows = new Map<number, Partial<Show>>();
    const uniquePersonaIds = new Set<number>();
    const uniqueTimeslots = new Map<string, Map<string, Partial<ShowTimeslot>>>;

    for (const zShow of zShows) {
      mergeZShowIntoShowMap(uniqueShows, zShow)
      extractZShowPersonaIds(uniquePersonaIds, zShow)
      appendZShowTimeslotByShowName(uniqueTimeslots, zShow, season)
    }

    this.personasService.filterSetOfPersonaIds(uniquePersonaIds)
    
    // Insert Unique Shows into the DB
    await this.showsService.batchInsertNewShows(Array.from(uniqueShows.values()));
    
  }


}