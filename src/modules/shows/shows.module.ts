import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShowsService } from './shows.service';
import { ShowsController } from './shows/v1/shows.controller';
import { Show } from '~/shared/entities/show.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Show]),
  ],
  providers: [
    ShowsService,
  ],
  controllers: [ShowsController],
  exports: [ ShowsService ]
})
export class ShowsModule {}