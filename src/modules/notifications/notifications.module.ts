import { Module } from '@nestjs/common';
import { NotificationService } from './notifications.service';
import { ApnsProvider } from './apns.provider';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationSubscription } from '~/shared/entities/show-notification-subscription.entity';
import { Show } from '~/shared/entities/show.entity';
import { NotificationController } from './controllers/v1/notifications.controller';
import { NotificationsTask } from './notifications.task';

@Module({
  imports: [
    TypeOrmModule.forFeature([NotificationSubscription, Show]),
  ],
  controllers: [NotificationController],
  providers: [
    NotificationsTask,
    NotificationService,
    ApnsProvider,
  ],
  exports: [
    NotificationService,
  ],
})
export class NotificationModule {}