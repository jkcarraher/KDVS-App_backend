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
    return this.showTimeslotRepository.find();
  }

  findOne(id: number): Promise<ShowTimeslot | null> {
    return this.showTimeslotRepository.findOneBy({ id });
  }

  create(timeslot: Partial<ShowTimeslot>): Promise<ShowTimeslot> {
    const newTimeslot = this.showTimeslotRepository.create(timeslot);
    return this.showTimeslotRepository.save(newTimeslot);
  }

  update(id: number, timeslot: Partial<ShowTimeslot>): Promise<ShowTimeslot> {
    return this.showTimeslotRepository.save({
      ...timeslot,
      id,
    });
  }

  remove(id: number): Promise<void> {
    return this.showTimeslotRepository.delete(id).then(() => {});
  }
}
