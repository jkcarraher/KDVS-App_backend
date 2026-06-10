import { Module } from '@nestjs/common';
import { NotificationService } from './notifications.service';
import { ApnsProvider } from './apns.provider';

@Module({
  providers: [
    NotificationService,
    ApnsProvider,
  ],
  exports: [
    NotificationService,
  ],
})
export class NotificationModule {}