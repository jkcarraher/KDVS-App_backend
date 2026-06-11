import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { IngestionService } from "./ingestion.service";
import { NotificationQueueService } from "../notifications/notification-queue.service";
import { TimeslotsService } from "../timeslots/timeslots.service";
import { combineDateAndTime, getDateForWeekday } from "../timeslots/timeslots.helper";

@Injectable()
export class IngestionTask {
  private readonly logger = new Logger(IngestionTask.name);

  constructor(
    private readonly ingestor: IngestionService,
    private readonly timeslotService: TimeslotsService,
    private readonly notificationQueue: NotificationQueueService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleDailyJob() {
    this.logger.log("Show scraper cron job started")

    await this.ingestor.updateDB();

    await this.scheduleNotifications();
  }

  private async scheduleNotifications() {
    const slots =
      await this.timeslotService.getUpcomingTimeslots(6);

    const now = new Date();

    for (const slot of slots) {
      this.logger.log("Logging " + slot.show.name);

      const baseDate = getDateForWeekday(slot.weekday);

      const startDateTime = combineDateAndTime(
        baseDate,
        slot.start_time,
      );

      const sendAt = new Date(startDateTime);
      sendAt.setMinutes(sendAt.getMinutes() - 15);

      if (sendAt.getTime() <= now.getTime()) {
        continue;
      }

      await this.notificationQueue.enqueueShowReminder(
        slot.show.id,
        sendAt,
      );
    }
  }
}