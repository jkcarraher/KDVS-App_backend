import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import dayjs from 'dayjs';

@Injectable()
export class NotificationQueueService {
  constructor(
    @InjectQueue('notifications')
    private readonly queue: Queue,
  ) {}

  async enqueueShowReminder(showId: string, startTime: Date) {
    const sendAt = new Date(startTime);
    sendAt.setMinutes(sendAt.getMinutes() - 15);

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
      },
    );
  }
}