import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TimeslotsController } from './controllers/v1/timeslots.controller';
import { TimeslotsService } from './timeslots.service';
import { ShowTimeslot } from '~/shared/entities/show-timeslot.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ShowTimeslot])
  ],
  providers: [
    TimeslotsService
  ],
  controllers: [TimeslotsController],
  exports: [ TimeslotsService ],
})
export class TimeslotsModule {}
