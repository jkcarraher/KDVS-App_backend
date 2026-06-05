import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShowTimeslot } from '../entities/show-timeslot.entity';
import { TimeslotsController } from './timeslots.controller';
import { TimeslotsService } from './timeslots.service';

@Module({
  imports: [TypeOrmModule.forFeature([ShowTimeslot])],
  providers: [TimeslotsService],
  controllers: [TimeslotsController],
  exports: [TimeslotsService],
})
export class TimeslotsModule {}
