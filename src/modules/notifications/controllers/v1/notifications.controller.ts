import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { NotificationService } from '../../notifications.service';


@Controller('notifications')
export class NotificationController {
  constructor(
    private readonly notificationService:
      NotificationService,
  ) {}

  @Post('subscribe')
  async subscribe(
    @Body('deviceToken') deviceToken: string,
    @Body('showId') showId: string,
  ) {
    return this.notificationService.subscribe(
      deviceToken,
      showId,
    );
  }

  @Delete('subscribe/:showId')
  async unsubscribe(
    @Param('showId') showId: string,
    @Query('deviceToken')
    deviceToken: string,
  ) {
    await this.notificationService.unsubscribe(
      deviceToken,
      showId,
    );

    return {
      success: true,
    };
  }

  @Get('subscribe/:showId')
  async isSubscribed(
    @Param('showId') showId: string,
    @Query('deviceToken')
    deviceToken: string,
  ) {
    const subscribed =
      await this.notificationService.isSubscribed(
        deviceToken,
        showId,
      );

    return {
      subscribed,
    };
  }
}