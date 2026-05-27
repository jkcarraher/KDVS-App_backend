import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { TypeOrmModule } from '@nestjs/typeorm';
import { ShowsModule } from './shows/shows.module';
import { ScheduleModule } from '@nestjs/schedule';
import { Season, Show } from './entities/show.entity';
import { ShowTimeslot } from './entities/show-timeslot.entity';

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
      entities: [Show, Season, ShowTimeslot],
      synchronize: true,
      autoLoadEntities: true,
    }),
    ShowsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
