import { Injectable, Logger } from "@nestjs/common";
import { NotificationService } from "./notifications.service";
import { Cron } from "@nestjs/schedule";

@Injectable()
export class NotificationTask {
  constructor(private readonly notifier: NotificationService) {}

  @Cron('*/5 * * * *')
  async testNotification() {
    await this.notifier.sendShowReminder(
      process.env.TEST_DEVICE_TOKEN!,
      "Children of the Corn"
    );
  }

}