import { Module } from '@nestjs/common';
import { IngestionTask } from './ingestion.task';
import { TimeslotsModule } from '../timeslots/timeslots.module';
import { IngestionService } from './ingestion.service';
import { PersonasModule } from '../personas/personas.module';
import { SeasonsModule } from '../seasons/seasons.module';
import { ShowsModule } from '../shows/shows.module';

@Module({
  imports: [
    ShowsModule,
    SeasonsModule,
    PersonasModule,
    TimeslotsModule,
  ],
  providers: [
    IngestionService,
    IngestionTask,
  ],
  exports: [
    IngestionTask,
  ],
})
export class IngestionModule {}