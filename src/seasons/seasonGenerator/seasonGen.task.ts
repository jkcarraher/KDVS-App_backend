import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { SeasonGenService } from './seasonGen.service';

@Injectable()
export class SeasonGenTask implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeasonGenTask.name);

  constructor(private readonly seasonGen: SeasonGenService) {}

  onApplicationBootstrap(): Promise<void> {
    return this.populateSeasonsForNextTenYears();
  }

  @Cron('0 0 0 1 1 *', {
    timeZone: 'America/Los_Angeles',
  })
  async handleAnnualSeasonGeneration(): Promise<void> {
    this.logger.log('Running annual season generation');
    await this.populateSeasonsForNextTenYears();
  }

  private async populateSeasonsForNextTenYears(): Promise<void> {
    const startYear = this.getCurrentAcademicYear();
    const endYear = startYear + 9;

    this.logger.log(`Ensuring seasons for academic years ${startYear} through ${endYear}`);

    for (let year = startYear; year <= endYear; year += 1) {
      await this.seasonGen.generateSeasonsForYear(year);
    }

    this.logger.log('Season generation complete');
  }
  private getCurrentAcademicYear(): number {
    const today = new Date();
    const currentYear = today.getUTCFullYear();
    const fallStart = this.getDefaultFallStart(currentYear);

    return today < fallStart ? currentYear - 1 : currentYear;
  }

  private getDefaultFallStart(year: number): Date {
    const septFirst = new Date(Date.UTC(year, 8, 1));
    const dayOfWeek = septFirst.getUTCDay();
    const offset = ((1 - dayOfWeek + 7) % 7) + 14;
    return new Date(Date.UTC(year, 8, 1 + offset));
  }
}