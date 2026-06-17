import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShowTimeslot } from '~/shared/entities/show-timeslot.entity';
import { toZonedTime, format } from 'date-fns-tz';
import { DEFAULT_TIMEZONE } from '~/shared/consts/consts';
import { Show } from '~/shared/entities/show.entity';

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

  async findCurrent(): Promise<ShowTimeslot | null> {
    const now = new Date();
    const pstNow = toZonedTime(now, 'America/Los_Angeles');

    const jsDay = pstNow.getDay();
    const weekday = jsDay === 0 ? 7 : jsDay;

    const currentTime = format(pstNow, 'HH:mm:ss', { timeZone: 'America/Los_Angeles' });
    const currentDay = format(pstNow, 'yyyy-MM-dd', { timeZone: 'America/Los_Angeles' });

    const result = await this.showTimeslotRepository
      .createQueryBuilder('slot')
      .leftJoinAndSelect('slot.show', 'show')
      .leftJoinAndSelect('slot.season', 'season')
      .leftJoinAndSelect('slot.personas', 'personas')
      .where('slot.weekday = :weekday', { weekday })
      .andWhere(':currentTime BETWEEN slot.start_time AND slot.end_time', { currentTime })
      .andWhere('season.start_date <= :currentDay', { currentDay })
      .andWhere('season.end_date >= :currentDay', { currentDay })
      .getOne();

    return result ?? null;
  }

  async getUpcomingTimeslots() {
    const now = new Date();
    const pstNow = toZonedTime(now, DEFAULT_TIMEZONE);

    const currentTime = format(pstNow, 'HH:mm:ss');
    const weekday = pstNow.getDay() === 0 ? 7 : pstNow.getDay();

    return this.showTimeslotRepository
      .createQueryBuilder('slot')
      .leftJoinAndSelect('slot.show', 'show')
      .leftJoinAndSelect('slot.season', 'season')
      .leftJoinAndSelect('slot.personas', 'personas')
      .where('slot.weekday = :weekday', { weekday })

      .andWhere('season.start_date <= :today', {
        today: format(pstNow, 'yyyy-MM-dd', {
          timeZone: DEFAULT_TIMEZONE,
        }),
      })
      .andWhere('season.end_date >= :today', {
        today: format(pstNow, 'yyyy-MM-dd', {
          timeZone: DEFAULT_TIMEZONE,
        }),
      })
      .andWhere('slot.start_time >= :currentTime', {
        currentTime,
      })
      .getMany();
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

  async getAllShowsForThisSeason(): Promise<Show[]> {
    const today = format(
      toZonedTime(new Date(), DEFAULT_TIMEZONE),
      'yyyy-MM-dd',
      { timeZone: DEFAULT_TIMEZONE },
    );

    const timeslots = await this.showTimeslotRepository
      .createQueryBuilder('slot')
      .leftJoinAndSelect('slot.show', 'show')
      .leftJoinAndSelect('slot.season', 'season')
      .where('season.start_date <= :today', { today })
      .andWhere('season.end_date >= :today', { today })
      .getMany();

    return [
      ...new Map(
        timeslots
          .filter((slot) => slot.show)
          .map((slot) => [slot.show.id, slot.show]),
      ).values(),
    ];
  }
}
