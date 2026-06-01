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

    this.showScraper.updateDB()
  }
}