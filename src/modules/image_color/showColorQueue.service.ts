import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

export const SHOW_COLOR_QUEUE = 'show-color';
export const EXTRACT_SHOW_COLOR_JOB = 'extract-show-color';

@Injectable()
export class ShowColorQueueService {
  constructor(
    @InjectQueue(SHOW_COLOR_QUEUE)
    private readonly queue: Queue,
  ) {}

  async enqueueShow(showId: string) {
    return this.queue.add(
      EXTRACT_SHOW_COLOR_JOB,
      { showId },
      {
        jobId: `show-color-${showId}`,
        attempts: 3,
        removeOnComplete: 100,
        removeOnFail: 1000,
      },
    );
  }

  async enqueueShows(showIds: string[]) {
    return Promise.all(
      showIds.map((showId) => this.enqueueShow(showId)),
    );
  }
}