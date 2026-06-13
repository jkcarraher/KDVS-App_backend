import { Module } from "@nestjs/common";
import { ShowColorService } from "./showColor.service";
import { TimeslotsModule } from "../timeslots/timeslots.module";
import { BullModule } from "@nestjs/bullmq";
import { ShowColorTask } from "./showColor.task";
import { SHOW_COLOR_QUEUE, ShowColorQueueService } from "./showColorQueue.service";
import { ShowsModule } from "../shows/shows.module";
import { ShowColorProcessor } from "./showColor.processor";

@Module({
  imports: [
    ShowsModule,
    TimeslotsModule,
    BullModule.registerQueue({
      name: SHOW_COLOR_QUEUE,
    }),
  ],
  providers: [
    ShowColorProcessor,
    ShowColorQueueService,
    ShowColorService,
    ShowColorTask,
  ],
  exports: [
    ShowColorTask,
  ],
})
export class ShowColorModule {}