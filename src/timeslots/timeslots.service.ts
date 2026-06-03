import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShowTimeslot } from '../entities/show-timeslot.entity';

@Injectable()
export class TimeslotsService {
  constructor(
    @InjectRepository(ShowTimeslot)
    private readonly showTimeslotRepository: Repository<ShowTimeslot>,
  ) {}

  findAll(): Promise<ShowTimeslot[]> {
    return this.showTimeslotRepository.find({
      relations: ['personas', 'show', 'season'],
    });
  }

  findOne(id: string): Promise<ShowTimeslot | null> {
    return this.showTimeslotRepository.findOne({
      where: { id },
      relations: ['personas', 'show', 'season'],
    });
  }

  create(timeslot: Partial<ShowTimeslot>): Promise<ShowTimeslot> {
    const newTimeslot = this.showTimeslotRepository.create(timeslot);
    return this.showTimeslotRepository.save(newTimeslot);
  }

  update(id: string, timeslot: Partial<ShowTimeslot>): Promise<ShowTimeslot> {
    return this.showTimeslotRepository.save({
      ...timeslot,
      id,
    });
  }

  remove(id: number): Promise<void> {
    return this.showTimeslotRepository.delete(id).then(() => {});
  }

  async replaceSeasonTimeslots(
    seasonId: number,
    timeslots: Partial<ShowTimeslot>[],
  ): Promise<ShowTimeslot[]> {
    return await this.showTimeslotRepository.manager.transaction(
      async (manager) => {
        await manager.delete(ShowTimeslot, {
          season: { id: seasonId },
        });

        if (!timeslots?.length) {
          return [];
        }

        const newTimeslots = manager.create(ShowTimeslot, timeslots);
        return manager.save(ShowTimeslot, newTimeslots);
      },
    );
  }
}
