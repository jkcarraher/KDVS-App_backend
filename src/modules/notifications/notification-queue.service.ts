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