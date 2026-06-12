import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { IngestionService } from "./ingestion.service";
import { NotificationQueueService } from "../notifications/notification-queue.service";
import { TimeslotsService } from "../timeslots/timeslots.service";
import { combineDateAndTime, getDateForWeekday } from "../timeslots/timeslots.helper";
import { formatInTimeZone, toZonedTime } from "date-fns-tz";
import { DEFAULT_TIMEZONE } from "~/shared/consts/consts";

@Injectable()
export class IngestionTask {
  private readonly logger = new Logger(IngestionTask.name);

  constructor(
    private readonly ingestor: IngestionService,
    private readonly timeslotService: TimeslotsService,
    private readonly notificationQueue: NotificationQueueService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async runScheduleSync() {
    this.logger.log("Show scraper cron job started")

    await this.ingestor.updateDB();

    await this.scheduleNotifications();
  }

  private async scheduleNotifications() {
    const slots =
      await this.timeslotService.getUpcomingTimeslots();

    const now = toZonedTime(new Date(), DEFAULT_TIMEZONE);

    for (const slot of slots) {

      const baseDate = getDateForWeekday(slot.weekday);

      const startDateTime = combineDateAndTime(
        baseDate,
        slot.start_time,
      );

      this.logger.log(startDateTime.toISOString())

      const sendAt = new Date(startDateTime);
      sendAt.setMinutes(sendAt.getMinutes() - 5);

      if (sendAt.getTime() <= now.getTime()) {
        continue;
      }

      this.logger.log(
        `Logging ${slot.show.name} @ ${formatInTimeZone(
          sendAt,
          'America/Los_Angeles',
          'HH:mm:ss'
        )}`
      );

      await this.notificationQueue.enqueueShowReminder(
        slot.show.id,
        sendAt,
      );
    }
  }
}