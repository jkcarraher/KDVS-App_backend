import { Injectable, Logger } from "@nestjs/common";
import { Show } from "../../entities/show.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { fetchSchedulePages, flattenScheduleResponses, mapScheduleItemsToUniqueShows } from "./show-scraper.helpers";

@Injectable()
export class ShowScraperService {
  constructor(
    @InjectRepository(Show)
    private readonly showRepository: Repository<Show>,
  ) {}

  private readonly logger = new Logger(ShowScraperService.name);

  async fetchShowsAndUpdateDB(seasonId?: number) {
    //if (!seasonId) { throw new Error('Must pass in seasonId to know what dateRange to query') }

    // Fetch this season's date range, convert that to a range of offsets from "today in PST"

    // Make API calls for that offset range past, present & future
    const zShows = flattenScheduleResponses( await fetchSchedulePages() )

    // This should give us a list of API Show objects from which we can build a list of Show Objects to insert into the DB
    const uniqueShows = mapScheduleItemsToUniqueShows(zShows)

    const existingShows = await this.showRepository.find({
      where: {
        spinitron_show_id: In(
          uniqueShows
            .map(show => show.spinitron_show_id)
            .filter((id): id is string => id !== undefined),
        ),
      },
      select: ['spinitron_show_id'],
    });

    const existingIds = new Set(existingShows.map(show => show.spinitron_show_id));

    const newShows = uniqueShows.filter(
      show => !existingIds.has(String(show.spinitron_show_id)),
    );

    if (newShows.length === 0) {
      return;
    }

    await this.showRepository.save(newShows);
  }
}