import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Season } from '../../entities/season.entity';

type QuarterName = 'Fall' | 'Winter' | 'Spring' | 'Summer';

interface AcademicSeasonInput {
  name: string;
  start_date: string;
  end_date: string;
}

@Injectable()
export class SeasonGenService {
  private readonly logger = new Logger(SeasonGenService.name);

  constructor(
    @InjectRepository(Season)
    private readonly seasonRepository: Repository<Season>,
  ) {}

  async generateSeasonsForYear(
    academicYear: number,
    fallStartDate?: string,
  ): Promise<Season[]> {
    const seasons = this.buildSeasonsForYear(academicYear, fallStartDate);

    const existing = await this.seasonRepository.find({
      where: { name: In(seasons.map((s) => s.name)) },
    });

    const existingByName = new Map(existing.map((season) => [season.name, season]));

    const saved = await this.seasonRepository.save(
      seasons.map((season) => ({
        ...season,
        id: existingByName.get(season.name)?.id,
      })),
    );

    this.logger.log(`Generated ${saved.length} seasons for academic year ${academicYear}`);
    return saved;
  }

  buildSeasonsForYear(
    academicYear: number,
    fallStartDate?: string,
  ): AcademicSeasonInput[] {
    const fallStart =
      fallStartDate != null ? new Date(fallStartDate) : this.defaultFallStart(academicYear);

    const quarterLengths = [11, 10, 10, 10]; // weeks
    const quarterNames: QuarterName[] = ['Fall', 'Winter', 'Spring', 'Summer'];

    const seasons: AcademicSeasonInput[] = [];
    let currentStart = this.alignToMonday(fallStart);

    for (let index = 0; index < quarterNames.length; index += 1) {
      const name = quarterNames[index];
      const weeks = quarterLengths[index];
      const provisionalEnd = this.addDays(currentStart, weeks * 7 - 1);
      const endDate = this.alignToSunday(provisionalEnd);

      seasons.push({
        name: `${name} ${this.seasonYear(academicYear, name)}`,
        start_date: this.formatDate(currentStart),
        end_date: this.formatDate(endDate),
      });

      currentStart = this.nextMonday(endDate);
    }

    return seasons;
  }

  private seasonYear(academicYear: number, name: QuarterName): number {
    if (name === 'Fall') return academicYear;
    return academicYear + 1;
  }

  private defaultFallStart(academicYear: number): Date {
    // UC Davis Fall quarter typically begins in late September.
    // This finds the third Monday of September as a reasonable default.
    const septFirst = new Date(Date.UTC(academicYear, 8, 1));
    const dayOfWeek = septFirst.getUTCDay();
    const offset = ((1 - dayOfWeek + 7) % 7) + 14;
    return new Date(Date.UTC(academicYear, 8, 1 + offset));
  }

  private alignToMonday(date: Date): Date {
    const result = new Date(date);
    const day = result.getUTCDay();
    if (day === 1) return result;
    const delta = (8 - day) % 7;
    result.setUTCDate(result.getUTCDate() + delta);
    return result;
  }

  private alignToSunday(date: Date): Date {
    const result = new Date(date);
    const day = result.getUTCDay();
    const delta = (7 - day) % 7;
    result.setUTCDate(result.getUTCDate() + delta);
    return result;
  }

  private nextMonday(date: Date): Date {
    const result = new Date(date);
    result.setUTCDate(result.getUTCDate() + 1);
    return this.alignToMonday(result);
  }

  private addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setUTCDate(result.getUTCDate() + days);
    return result;
  }

  private formatDate(date: Date): string {
    return date.toISOString().slice(0, 10);
  }
}