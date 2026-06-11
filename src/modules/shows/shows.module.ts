import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShowsService } from './shows.service';
import { ShowsController } from './shows/v1/shows.controller';
import { Show } from '~/shared/entities/show.entity';
import { Season } from '~/shared/entities/season.entity';
import { PersonasModule } from '../personas/personas.module';
import { TimeslotsModule } from '../timeslots/timeslots.module';
import { IngestionService } from '../ingestion/ingestion.service';
import { IngestionTask } from '../ingestion/ingestion.task';
import { NotificationModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Show, Season]),
    NotificationModule,
    PersonasModule,
    TimeslotsModule,
  ],
  providers: [
    ShowsService,
    IngestionService,
    IngestionTask,
  ],
  controllers: [ShowsController],
})
export class ShowsModule {}