import { Controller, Get, Post, Body, Param, Put, Delete, ParseUUIDPipe } from '@nestjs/common';
import { TimeslotsService } from '../../timeslots.service';
import { ShowTimeslot } from '~/shared/entities/show-timeslot.entity';

@Controller({
  path: 'timeslots',
  version: '1',
})
export class TimeslotsController {
  constructor(private readonly timeslotsService: TimeslotsService) {}

  @Get()
  findAllActive(): Promise<ShowTimeslot[]> {
    return this.timeslotsService.findAllActive();
  }

  @Get('current')
  findCurrent(): Promise<ShowTimeslot | null> {
    return this.timeslotsService.findCurrent();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<ShowTimeslot | null> {
    return this.timeslotsService.findOne(id);
  }
}
