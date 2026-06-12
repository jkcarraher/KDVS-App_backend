import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { SeasonGenService } from './seasonGen.service';

@Injectable()
export class SeasonGenTask {
  private readonly logger = new Logger(SeasonGenTask.name);

  constructor(private readonly seasonGen: SeasonGenService) {}

  @Cron('0 0 0 1 1 *', { timeZone: 'America/Los_Angeles' })
  async seasonGenerationTask(): Promise<void> {
    this.logger.log('Running annual season generation');
    await this.seasonGen.populateSeasonsForNextTenYears();
  }
}