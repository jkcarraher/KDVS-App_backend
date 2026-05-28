
import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { Season } from '../entities/season.entity';
import { SeasonsService } from './seasons.service';

@Controller('seasons')
export class SeasonsController {
  constructor(private readonly seasonsService: SeasonsService) {}

  @Get()
  findAll(): Promise<Season[]> {
    return this.seasonsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<Season | null> {
    return this.seasonsService.findOne(id);
  }

  @Post()
  create(@Body() season: Partial<Season>): Promise<Season> {
    return this.seasonsService.create(season);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() season: Partial<Season>): Promise<Season> {
    return this.seasonsService.update(id, season);
  }

  @Delete(':id')
  remove(@Param('id') id: number): Promise<void> {
    return this.seasonsService.remove(id);
  }
}
