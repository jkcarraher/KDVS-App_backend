import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { SeasonGenService } from './seasonGen.service';
import { DEFAULT_TIMEZONE } from '~/shared/consts/consts';

@Injectable()
export class SeasonGenTask {
  private readonly logger = new Logger(SeasonGenTask.name);

  constructor(private readonly seasonGen: SeasonGenService) {}

  @Cron('0 0 0 1 1 *', { timeZone: DEFAULT_TIMEZONE })
  async seasonGenerationTask(): Promise<void> {
    this.logger.log('Running annual season generation task');
    await this.seasonGen.populateSeasonsForNextTenYears();
  }
}