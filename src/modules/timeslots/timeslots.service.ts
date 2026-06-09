import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShowTimeslot } from '~/shared/entities/show-timeslot.entity';
import { toZonedTime, format } from 'date-fns-tz';

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

  findCurrent(): Promise<ShowTimeslot | null> {
    const now = new Date();
    const pstNow = toZonedTime(now, 'America/Los_Angeles')

    const jsDay = pstNow.getDay();
    const weekday = jsDay === 0 ? 7 : jsDay;
    const currentTime = format(pstNow, 'HH:mm:ss', {timeZone: 'America/Los_Angeles'});

    return this.showTimeslotRepository
      .createQueryBuilder('slot')
      .where('slot.weekday = :weekday', { weekday })
      .andWhere(':currentTime BETWEEN slot.start_time AND slot.end_time', {
        currentTime,
      })
      .getOne();
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

  remove(id: string): Promise<void> {
    return this.showTimeslotRepository.delete(id).then(() => {});
  }

  async replaceSeasonTimeslots(
    seasonId: string,
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
