import { Injectable, Logger } from "@nestjs/common";
import { ShowScraperService } from "./show-scraper.service";
import { Cron, CronExpression } from "@nestjs/schedule";
import { fetchZShowsForSeason } from "./kdvs-api/kdvs-api.client";
import { Show } from "~/entities/show.entity";
import { mergeZShowIntoShowMap } from "./kdvs-api/kdvs-api.helpers";
import { ShowTimeslot } from "~/entities/show-timeslot.entity";
import { extractZShowPersonaIds } from "./spinitron/spinitron.helper";
import { appendZShowTimeslotByShowName } from "~/timeslots/timeslots.helper";

@Injectable()
export class ShowScraperTask {
  private readonly logger = new Logger(ShowScraperTask.name);

  constructor(private readonly showScraper: ShowScraperService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleDailyJob() {
    this.logger.log("Show scraper cron job started")

    // Get the current Season if any
    const season = await this.showScraper.getCurrentSeason();
    if (!season) {
      this.logger.warn('No current season found for show scraper.');
      return;
    }

    // Get KDVS' zShows
    const zShows = await fetchZShowsForSeason(season)
    
    // Keep a map of Show objects unique by their Name (key of map is ShowName).
    const uniqueShows = new Map<string, Partial<Show>>();
    const uniquePersonaIds = new Set<string>();
    const uniqueTimeslots = new Map<string, Map<string, Partial<ShowTimeslot>>>;

    for (const zShow of zShows) {
      mergeZShowIntoShowMap(uniqueShows, zShow)
      extractZShowPersonaIds(uniquePersonaIds, zShow)
      appendZShowTimeslotByShowName(uniqueTimeslots, zShow, season)
    }
    this.logger.log(uniqueTimeslots)
  }
}