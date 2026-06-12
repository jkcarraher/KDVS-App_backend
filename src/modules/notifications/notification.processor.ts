import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { NotificationService } from './notifications.service';

@Processor('notifications')
export class NotificationProcessor extends WorkerHost {
  constructor(
    private readonly notificationService: NotificationService,
  ) {
    super();
  }

  async process(job: Job<any>) {
    switch (job.name) {
      case 'show-reminder':
        await this.notificationService.sendShowReminders( job.data.showId );
        break;
    }
  }
}