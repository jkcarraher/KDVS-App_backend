import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { TypeOrmModule } from '@nestjs/typeorm';
import { ShowsModule } from './shows/shows.module';
import { ScheduleModule } from '@nestjs/schedule';
import { Show } from './entities/show.entity';
import { ShowTimeslot } from './entities/show-timeslot.entity';
import { Season } from './entities/season.entity';
import { HealthModule } from './health/health.module';
import { SeasonsModule } from './seasons/seasons.module';
import { Persona } from './entities/persona.entity';
import { TimeslotsModule } from './timeslots/timeslots.module';
import { PersonasModule } from './personas/personas.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'db',
      port: parseInt(process.env.DB_PORT!, 10) || 5432,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: 'postgres',
      entities: [Show, Season, ShowTimeslot, Persona],
      synchronize: true,
      autoLoadEntities: true,
    }),
    ShowsModule,
    SeasonsModule,
    TimeslotsModule,
    PersonasModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
