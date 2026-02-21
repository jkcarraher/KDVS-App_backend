
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Show } from '../entities/show.entity';

@Injectable()
export class ShowsService {
	constructor(
		@InjectRepository(Show)
		private readonly showRepository: Repository<Show>,
	) {}

	findAll(): Promise<Show[]> {
		return this.showRepository.find();
	}

	findOne(id: number): Promise<Show | null> {
		return this.showRepository.findOneBy({ id });
	}

	create(show: Partial<Show>): Promise<Show> {
		const newShow = this.showRepository.create(show);
		return this.showRepository.save(newShow);
	}

	update(id: number, show: Partial<Show>): Promise<Show> {
		return this.showRepository.save({ ...show, id });
	}

	remove(id: number): Promise<void> {
		return this.showRepository.delete(id).then(() => {});
	}
}
