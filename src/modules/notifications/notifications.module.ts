import { Module } from '@nestjs/common';
import { NotificationService } from './notifications.service';
import { ApnsProvider } from './apns.provider';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationSubscription } from '~/shared/entities/show-notification-subscription.entity';
import { Show } from '~/shared/entities/show.entity';
import { NotificationController } from './controllers/v1/notifications.controller';
import { NotificationProcessor } from './notification.processor';
import { NotificationQueueService } from './notification-queue.service';
import { BullModule } from '@nestjs/bullmq';
import { NotificationsTask } from './notifications.task';
import { TimeslotsModule } from '../timeslots/timeslots.module';

@Module({
  imports: [
    TimeslotsModule,
    BullModule.registerQueue({
      name: 'notifications',
    }),
    TypeOrmModule.forFeature([NotificationSubscription, Show]),
  ],
  controllers: [NotificationController],
  providers: [
    NotificationQueueService,
    NotificationProcessor,
    NotificationsTask,
    NotificationService,
    ApnsProvider,
  ],
  exports: [
    NotificationService,
    NotificationsTask,
  ],
})
export class NotificationModule {}