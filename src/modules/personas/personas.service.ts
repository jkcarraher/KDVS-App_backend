import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Persona } from '../entities/persona.entity';

@Injectable()
export class PersonasService {
  constructor(
    @InjectRepository(Persona)
    private readonly personaRepository: Repository<Persona>,
  ) {}

  findAll(): Promise<Persona[]> {
    return this.personaRepository.find();
  }

  findOne(id: string): Promise<Persona | null> {
    return this.personaRepository.findOneBy({ id });
  }

  create(persona: Partial<Persona>): Promise<Persona> {
    const newPersona = this.personaRepository.create(persona);
    return this.personaRepository.save(newPersona);
  }

  update(id: string, persona: Partial<Persona>): Promise<Persona> {
    return this.personaRepository.save({
      ...persona,
      id,
    });
  }

  remove(id: string): Promise<void> {
    return this.personaRepository.delete(id).then(() => {});
  }

  async createMany(personas: Partial<Persona>[]): Promise<Persona[]> {
    if (!personas?.length) return [];
    const newPersonas = this.personaRepository.create(personas);
    return this.personaRepository.save(newPersonas);
  }

  async filterSetOfPersonaIds(filterIds: Set<string>): Promise<Set<string>> {
    if (filterIds.size === 0) return filterIds;

    const ids = [...filterIds];
    const existing = await this.personaRepository.findBy({
      id: In(ids),
    });

    return filterIds;
  }
}
