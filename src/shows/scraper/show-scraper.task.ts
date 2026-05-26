import { Injectable } from "@nestjs/common";
import { ShowScraperService } from "./show-scraper.service";
import { Cron, CronExpression } from "@nestjs/schedule";

@Injectable()
export class ShowScraperTask {
  constructor(private readonly showScraper: ShowScraperService) {}
  @Cron(CronExpression.EVERY_MINUTE)
  async handleDailyJob() {
    await this.showScraper.fetchShowsAndUpdateDB();
  }
}