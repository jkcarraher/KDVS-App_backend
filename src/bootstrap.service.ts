import { Injectable, OnApplicationBootstrap } from "@nestjs/common";
import { IngestionTask } from "./modules/ingestion/ingestion.task";
import { SeasonGenTask } from "./modules/seasons/seasonGenerator/seasonGen.task";
import { NotificationsTask } from "./modules/notifications/notifications.task";

@Injectable()
export class BootstrapService implements OnApplicationBootstrap {
  constructor(
      private readonly ingestionTask: IngestionTask,
      private readonly seasonGenTask: SeasonGenTask,
      private readonly notificationsTask: NotificationsTask
    ) {}

  async onApplicationBootstrap() {
    // Before the backend begins running:

    // 1. Generate Seasons Locally
    await this.seasonGenTask.seasonGenerationTask();
    // 2. Sync shows from KDVS-API/SPINITRON then schedule notifications 
    await this.ingestionTask.runScheduleSync();
    // 3. Schedule notifications for all shows until EOD
    await this.notificationsTask.scheduleNotifications();
  }
}