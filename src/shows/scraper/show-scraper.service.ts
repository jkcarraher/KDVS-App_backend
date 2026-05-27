import { Injectable, Logger } from "@nestjs/common";
import { Show } from "../../entities/show.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Injectable()
export class ShowScraperService {
  constructor(
    @InjectRepository(Show)
    private readonly showRepository: Repository<Show>,
  ) {}

  async fetchShowsAndUpdateDB(seasonId: number) {
    if (!seasonId) { throw new Error('Must pass in seasonId to know what dateRange to query') }

    // Fetch this season's date range, convert that to a range of offsets from "today in PST"

    // Make API calls for that offset range past, present & future -60,0,60

    // This should give us a list of API Show objects from which we can build a list of Show Objects to insert into the DB

    await this.showRepository.save(showEntities);
  }
}