import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShowsService } from './shows.service';
import { ShowsController } from './shows/v1/shows.controller';
import { Show } from '~/shared/entities/show.entity';
import { Season } from '~/shared/entities/season.entity';
import { PersonasModule } from '../personas/personas.module';
import { TimeslotsModule } from '../timeslots/timeslots.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Show, Season]),
  ],
  providers: [
    ShowsService,
  ],
  controllers: [ShowsController],
  exports: [ ShowsService ]
})
export class ShowsModule {}