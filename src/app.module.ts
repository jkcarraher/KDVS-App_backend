import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { Show } from './shared/entities/show.entity';
import { ShowTimeslot } from './shared/entities/show-timeslot.entity';
import { Season } from './shared/entities/season.entity';
import { HealthModule } from './modules/health/health.module';
import { Persona } from './shared/entities/persona.entity';
import { ShowsModule } from './modules/shows/shows.module';
import { SeasonsModule } from './modules/seasons/seasons.module';
import { TimeslotsModule } from './modules/timeslots/timeslots.module';
import { PersonasModule } from './modules/personas/personas.module';
import { NotificationModule } from './modules/notifications/notifications.module';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { BootstrapService } from './bootstrap.service';
import { IngestionModule } from './modules/ingestion/ingestion.module';
import { ShowColorModule } from './modules/image_color/showColor.module';
import { ListenerGateway } from './modules/listenerTracker/listener.gateway';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT!, 10),
      username: process.env.DB_USERNAME!,
      password: process.env.DB_PASSWORD!,
      database: 'postgres',
      entities: [Show, Season, ShowTimeslot, Persona],
      synchronize: true,
      autoLoadEntities: true,
    }),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST!,
        port: Number(process.env.REDIS_PORT!),
      },
    }),
    IngestionModule,
    ShowsModule,
    SeasonsModule,
    TimeslotsModule,
    PersonasModule,
    HealthModule,
    NotificationModule,
    ShowColorModule,
  ],
  providers: [
    BootstrapService,
    ListenerGateway
  ]
})
export class AppModule {}
