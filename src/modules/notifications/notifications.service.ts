import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { ApnsProvider } from "./apns.provider";
import * as apn from 'apn';
import { InjectRepository } from "@nestjs/typeorm";
import { NotificationSubscription } from "~/shared/entities/show-notification-subscription.entity";
import { Repository } from "typeorm";
import { Show } from "~/shared/entities/show.entity";

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(NotificationSubscription)
    private readonly subscriptionRepo: Repository<NotificationSubscription>,

    @InjectRepository(Show)
    private readonly showRepo: Repository<Show>,
    
    private readonly apnsProvider: ApnsProvider,
  ) {}

  async subscribe( deviceToken: string, showId: string ): Promise<NotificationSubscription> {
    const show = await this.showRepo.findOne({
      where: { id: showId },
    });

    if (!show) {
      throw new NotFoundException('Show not found');
    }

    const existing = await this.subscriptionRepo.findOne({
      where: {
        deviceToken,
        showId,
      },
    });

    if (existing) {
      throw new ConflictException(
        'Already subscribed',
      );
    }

    const subscription =
      this.subscriptionRepo.create({
        deviceToken,
        showId,
      });

    return this.subscriptionRepo.save(
      subscription,
    );
  }

  async unsubscribe(
    deviceToken: string,
    showId: string,
  ): Promise<void> {
    await this.subscriptionRepo.delete({
      deviceToken,
      showId,
    });
  }

  async isSubscribed(
    deviceToken: string,
    showId: string,
  ): Promise<boolean> {
    const subscription =
      await this.subscriptionRepo.findOne({
        where: {
          deviceToken,
          showId,
        },
      });

    return !!subscription;
  }

  async sendShowReminder(
    deviceToken: string,
    showName: string,
  ) {
    const note = new apn.Notification();

    note.topic = process.env.APN_BUNDLE_ID!;

    note.alert = {
      title: 'KDVS',
      body: `${showName} starts soon`,
    };

    await this.apnsProvider
      .getClient()
      .send(note, deviceToken);
  }
}