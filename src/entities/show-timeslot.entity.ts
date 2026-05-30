import { Show } from './show.entity';
import { Season } from './season.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity({ name: 'show_timeslots' })
export class ShowTimeslot {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'bigint' })
  show_id!: number;

  @ManyToOne(() => Show, { nullable: false })
  @JoinColumn({ name: 'show_id' })
  show!: Show;

  @Column({ type: 'bigint' })
  season_id!: number;

  @ManyToOne(() => Season, { nullable: false })
  @JoinColumn({ name: 'season_id' })
  season!: Season;

  @Column({ type: 'smallint' })
  weekday!: number;

  @Column({ type: 'time' })
  start_time!: string;

  @Column({ type: 'time' })
  end_time!: string;

  @Column({ type: 'smallint', default: 1 })
  recurrence_interval_weeks!: number;

  @Column({ type: 'smallint', default: 0 })
  recurrence_offset!: number;

  @Column({ type: 'text', default: 'America/Los_Angeles' })
  timezone!: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
