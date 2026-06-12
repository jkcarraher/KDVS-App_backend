import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PersonasV1Controller } from './controllers/v1/personas.controller';
import { PersonasService } from './personas.service';
import { Persona } from '~/shared/entities/persona.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Persona])],
  providers: [PersonasService],
  controllers: [
    PersonasV1Controller
  ],
  exports: [ PersonasService ],
})
export class PersonasModule {}
