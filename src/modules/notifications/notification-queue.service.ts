import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class NotificationQueueService {  
  constructor(
    @InjectQueue('notifications')
    private readonly queue: Queue,
  ) {}

  async enqueueShowReminder(showId: string, sendAt: Date) {
    const now = Date.now();
    const delay = sendAt.getTime() - now;

    const delayedJobs = await this.queue.getDelayed();

    for (const job of delayedJobs) {
      if (job.name === 'show-reminder') {
        await job.remove();
      }
    }

    await this.queue.clean(0, 10000, 'completed');
    await this.queue.clean(0, 10000, 'failed');

    const counts = await this.queue.getJobCounts(
      'waiting',
      'delayed',
      'active',
      'completed',
      'failed',
    );

    Logger.log(counts);

    if (delay <= 0) return;

    const jobId = `show-${showId}-${sendAt.getTime()}`;

    await this.queue.add(
      'show-reminder',
      { showId },
      {
        delay,
        jobId,
        removeOnComplete: true,
        removeOnFail: 1000,
      },
    );
  }
}