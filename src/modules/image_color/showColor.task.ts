import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Queue } from 'bullmq';

import { TimeslotsService } from '../timeslots/timeslots.service';
import { EXTRACT_SHOW_COLOR_JOB, SHOW_COLOR_QUEUE, ShowColorQueueService } from './showColorQueue.service';

@Injectable()
export class ShowColorTask {
  private readonly logger = new Logger(ShowColorTask.name);

  constructor(
    private readonly timeslotService: TimeslotsService,
    private readonly showColorQueueService: ShowColorQueueService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async runShowColorSync() {
    this.logger.log('Running hourly show color extraction task');

    const seasonShows =
      await this.timeslotService.getAllShowsForThisSeason();

    const showsMissingColor = seasonShows.filter(
      (show) => !show.color,
    );

    this.logger.log(
      `Found ${showsMissingColor.length} shows missing colors`,
    );

    await this.showColorQueueService.enqueueShows(
      showsMissingColor.map((show) => show.id),
    );
  }
}