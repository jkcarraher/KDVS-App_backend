import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Show } from '../entities/show.entity';
import { ShowsService } from './shows.service';
import { ShowsController } from './shows.controller';
import { ShowScraperService } from './scraper/show-scraper.service';
import { ShowScraperTask } from './scraper/show-scraper.task';
import { Season } from '../entities/season.entity';
import { PersonasModule } from '~/personas/personas.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Show, Season]),
    PersonasModule,
  ],
  providers: [
    ShowsService,
    ShowScraperService,
    ShowScraperTask,
  ],
  controllers: [ShowsController],
})
export class ShowsModule {}