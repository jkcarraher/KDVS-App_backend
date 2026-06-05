import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeasonsController } from './controllers/v1/seasons.controller';
import { SeasonGenService } from './seasonGenerator/seasonGen.service';
import { SeasonGenTask } from './seasonGenerator/seasonGen.task';
import { SeasonsService } from './seasons.service';
import { Season } from '~/entities/season.entity';

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