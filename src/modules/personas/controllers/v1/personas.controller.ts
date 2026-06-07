import { Controller, Get, Post, Body, Param, Put, Delete, ParseIntPipe } from '@nestjs/common';
import { PersonasService } from '../../personas.service';
import { Persona } from '~/shared/entities/persona.entity';

@Controller({
  path: 'personas',
  version: '1',
})
export class PersonasV1Controller {
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
