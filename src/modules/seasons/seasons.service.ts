
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { format, toZonedTime } from 'date-fns-tz';
import { LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { Season } from '~/shared/entities/season.entity';

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

  async findCurrent(): Promise<Season | null> {
    const pstNow = toZonedTime(
      new Date(),
      'America/Los_Angeles',
    );

    const today = format(pstNow, 'yyyy-MM-dd', {
      timeZone: 'America/Los_Angeles',
    });

    return this.seasonRepository
      .createQueryBuilder('season')
      .where('season.start_date <= :today', { today })
      .andWhere('season.end_date >= :today', { today })
      .getOne();
  }

  async getCurrentSeason(): Promise<Season | null> {
    const today = new Date().toISOString().slice(0, 10);
    return this.seasonRepository.findOne({
      where: {
        start_date: LessThanOrEqual(today),
        end_date: MoreThanOrEqual(today),
      },
    });
  }
}
