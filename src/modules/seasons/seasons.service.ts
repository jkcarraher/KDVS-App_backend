
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Season } from '~/entities/season.entity';

@Injectable()
export class SeasonsService {
  constructor(
    @InjectRepository(Season)
    private readonly seasonRepository: Repository<Season>,
  ) {}

  findAll(): Promise<Season[]> {
    return this.seasonRepository.find();
  }

  findOne(id: string): Promise<Season | null> {
    return this.seasonRepository.findOneBy({ id });
  }

  create(season: Partial<Season>): Promise<Season> {
    const newSeason = this.seasonRepository.create({
      ...season,
      is_auto_generated: season.is_auto_generated ?? false,
    });
    return this.seasonRepository.save(newSeason);
  }

  update(id: string, season: Partial<Season>): Promise<Season> {
    return this.seasonRepository.save({
      ...season,
      id,
      is_auto_generated: season.is_auto_generated ?? false,
    });
  }

  remove(id: string): Promise<void> {
    return this.seasonRepository.delete(id).then(() => {});
  }
}
