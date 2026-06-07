import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { Show } from './shared/entities/show.entity';
import { ShowTimeslot } from './shared/entities/show-timeslot.entity';
import { Season } from './shared/entities/season.entity';
import { HealthModule } from './health/health.module';
import { Persona } from './shared/entities/persona.entity';
import { ShowsModule } from './modules/shows/shows.module';
import { SeasonsModule } from './modules/seasons/seasons.module';
import { TimeslotsModule } from './modules/timeslots/timeslots.module';
import { PersonasModule } from './modules/personas/personas.module';


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
})
export class AppModule {}
