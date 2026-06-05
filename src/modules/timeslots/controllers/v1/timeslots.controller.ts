import { Controller, Get, Post, Body, Param, Put, Delete, ParseUUIDPipe } from '@nestjs/common';
import { TimeslotsService } from '../../timeslots.service';
import { ShowTimeslot } from '~/entities/show-timeslot.entity';

@Controller({
  path: 'timeslots',
  version: '1',
})
export class TimeslotsController {
  constructor(private readonly timeslotsService: TimeslotsService) {}

  @Get()
  findAll(): Promise<ShowTimeslot[]> {
    return this.timeslotsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<ShowTimeslot | null> {
    return this.timeslotsService.findOne(id);
  }

  @Post()
  create(@Body() timeslot: Partial<ShowTimeslot>): Promise<ShowTimeslot> {
    return this.timeslotsService.create(timeslot);
  }

  @Put(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() timeslot: Partial<ShowTimeslot>): Promise<ShowTimeslot> {
    return this.timeslotsService.update(id, timeslot);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.timeslotsService.remove(id);
  }
}
