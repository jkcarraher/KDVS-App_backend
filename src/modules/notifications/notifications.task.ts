import { Injectable, Logger } from "@nestjs/common";
import { NotificationService } from "./notifications.service";
import { Cron } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { NotificationSubscription } from "~/shared/entities/show-notification-subscription.entity";
import { Repository } from "typeorm";
import { Show } from "~/shared/entities/show.entity";

@Injectable()
export class NotificationsTask {
    private readonly logger = new Logger(NotificationsTask.name);

  constructor(
    private readonly notifier: NotificationService,

    @InjectRepository(NotificationSubscription)
    private readonly subscriptionRepo: Repository<NotificationSubscription>,

    @InjectRepository(Show)
    private readonly showRepo: Repository<Show>,
  ) {}

  @Cron('*/5 * * * *')
  async testNotification() {
    this.logger.log("Running notification test job...");

    const subscriptions = await this.subscriptionRepo.find({
      relations: {
        show: true,
      },
    });

    for (const sub of subscriptions) {
      this.logger.log("Sub", sub.deviceToken)

      try {
        await this.notifier.sendShowReminder(
          sub.deviceToken,
          sub.show.name
        );
      } catch (err) {
        this.logger.error(
          `Failed sending to ${sub.deviceToken}`,
          err
        );
      }
    }
  }

}