import { Injectable, Logger } from "@nestjs/common";
import { ShowScraperService } from "./show-scraper.service";
import { Cron, CronExpression } from "@nestjs/schedule";

@Injectable()
export class ShowScraperTask {
  private readonly logger = new Logger(ShowScraperTask.name);

  constructor(private readonly showScraper: ShowScraperService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleDailyJob() {
    this.logger.log("Show scraper cron job started")

    await this.showScraper.updateDB()
  }
}