import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { IngestionService } from "./ingestion.service";

@Injectable()
export class IngestionTask {
  private readonly logger = new Logger(IngestionTask.name);

  constructor(
    private readonly ingestor: IngestionService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async runScheduleSync() {
    this.logger.log("Running hourly show synchronization task")
    await this.ingestor.updateDB();
  }
}