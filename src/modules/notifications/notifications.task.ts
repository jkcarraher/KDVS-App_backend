import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { NotificationQueueService } from "../notifications/notification-queue.service";
import { TimeslotsService } from "../timeslots/timeslots.service";
import { combineDateAndTime, getDateForWeekday } from "../timeslots/timeslots.helper";
import { formatInTimeZone, toZonedTime } from "date-fns-tz";
import { DEFAULT_TIMEZONE } from "~/shared/consts/consts";

@Injectable()
export class NotificationsTask {
  private readonly logger = new Logger(NotificationsTask.name);

  constructor(
    private readonly timeslotService: TimeslotsService,
    private readonly notificationQueue: NotificationQueueService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async scheduleNotifications() {
    const slots =
      await this.timeslotService.getUpcomingTimeslots();

    const now = toZonedTime(new Date(), DEFAULT_TIMEZONE);

    for (const slot of slots) {

      const baseDate = getDateForWeekday(slot.weekday);

      const startDateTime = combineDateAndTime(
        baseDate,
        slot.start_time,
      );

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