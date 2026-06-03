import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Season } from '../entities/season.entity';
import { SeasonsController } from './seasons.controller';
import { SeasonGenService } from './seasonGenerator/seasonGen.service';
import { SeasonGenTask } from './seasonGenerator/seasonGen.task';
import { SeasonsService } from './seasons.service';

@Module({
  imports: [ TypeOrmModule.forFeature([Season]) ],
  providers: [
    SeasonsService,
    SeasonGenService,
    SeasonGenTask
  ],
  controllers: [SeasonsController],
})
export class SeasonsModule {}