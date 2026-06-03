import { Controller, Get, Post, Body, Param, Put, Delete, ParseIntPipe } from '@nestjs/common';
import { Persona } from '../entities/persona.entity';
import { PersonasService } from './personas.service';

@Controller('personas')
export class PersonasController {
  constructor(private readonly personasService: PersonasService) {}

  @Get()
  findAll(): Promise<Persona[]> {
    return this.personasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: string): Promise<Persona | null> {
    return this.personasService.findOne(id);
  }

  @Post()
  create(@Body() persona: Partial<Persona>): Promise<Persona> {
    return this.personasService.create(persona);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: string, @Body() persona: Partial<Persona>): Promise<Persona> {
    return this.personasService.update(id, persona);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: string): Promise<void> {
    return this.personasService.remove(id);
  }
}
