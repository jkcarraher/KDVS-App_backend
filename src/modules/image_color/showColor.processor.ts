import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { EXTRACT_SHOW_COLOR_JOB } from './showColorQueue.service';
import { ShowsService } from '../shows/shows.service';
import { ShowColorService } from './showColor.service';
import { Logger } from '@nestjs/common';

@Processor('show-color')
export class ShowColorProcessor extends WorkerHost {
  private readonly logger = new Logger(ShowColorProcessor.name);
  constructor(
    private readonly showsService: ShowsService,
    private readonly showColorService: ShowColorService,
  ) {
    super();
  }

  async process(job: Job<{ showId: string }>) {
    if (job.name !== EXTRACT_SHOW_COLOR_JOB) {
      return;
    }

    const show = await this.showsService.findOne(job.data.showId);

    if (!show) {
      this.logger.warn(`Show ${job.data.showId} not found`);
      return;
    }

    if (show.color) {
      this.logger.log(`Show ${show.id} already has a color`);
      return;
    }

    if (!show.image_url) {
      this.logger.warn(`Show ${show.id} has no image URL`);
      return;
    }

    const color = await this.showColorService.getAverageColorFromUrl(
      show.image_url,
    );

    await this.showsService.update(show.id, {
      color: color.hex,
    });

    this.logger.log(
      `Updated show ${show.id} with color ${color.hex}`,
    );
  }
}