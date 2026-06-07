
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Show } from '~/shared/entities/show.entity';

@Injectable()
export class ShowsService {
	constructor(
		@InjectRepository(Show)
		private readonly showRepository: Repository<Show>,
	) {}

	findAll(): Promise<Show[]> {
		return this.showRepository.find();
	}

	findOne(id: string): Promise<Show | null> {
		return this.showRepository.findOneBy({ id });
	}

	create(show: Partial<Show>): Promise<Show> {
		const newShow = this.showRepository.create(show);
		return this.showRepository.save(newShow);
	}

	update(id: string, show: Partial<Show>): Promise<Show> {
		return this.showRepository.save({ ...show, id });
	}

	remove(id: number): Promise<void> {
		return this.showRepository.delete(id).then(() => {});
	}

	async batchInsertNewShows(shows: Partial<Show>[]): Promise<Show[]> {
    const showIds = shows
      .map((show) => show.id)
      .filter((id) => id != null)
      .map(Number);

    if (showIds.length === 0) {
      return [];
    }

    const existingShows = await this.showRepository.findBy({
      id: In(showIds),
    });

    const existingIds = new Set(existingShows.map((show) => Number(show.id)));

    const newShows = shows.filter(
      (show) => show.id != null && !existingIds.has(Number(show.id)),
    );

    if (newShows.length === 0) {
      return [];
    }

    return this.showRepository.save(newShows);
  }
}
