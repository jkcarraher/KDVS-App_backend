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

  async fetchShowsAndUpdateDB() {
    const res = await fetch('https://kdvs.org/api/spinitron/schedule?offset=0');
    const data = await res.json();

    const scheduleItems = [...(data.future ?? []), ...(data.past ?? [])];

    const showEntities = scheduleItems.map((item: any) => {
      const start = new Date(item.start);
      const end = new Date(item.end);

      return {
        id: item.show_id,
        name: item.title,
        show_url: item._links?.self?.href ?? null,
        playlist_image_url: item.image ?? null,
        start_time: start.toISOString().slice(11, 19),
        end_time: end.toISOString().slice(11, 19),
        current_dotw: start.toLocaleDateString('en-US', { weekday: 'long', timeZone: item.timezone }),
        show_dates: [start.toISOString().slice(0, 10)],
        first_show_date: start.toISOString().slice(0, 10),
        last_show_date: start.toISOString().slice(0, 10),
        alternates: false,
      } as Partial<Show>;
    });

    await this.showRepository.save(showEntities);
  }
}