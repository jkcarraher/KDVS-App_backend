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
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Persona } from './persona.entity';

@Entity({ name: 'show_timeslots' })
export class ShowTimeslot {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'bigint' })
  show_id!: number;

  @ManyToOne(() => Show, { nullable: false })
  @JoinColumn({ name: 'show_id' })
  show!: Show;

  @ManyToMany(() => Persona)
  @JoinTable({
    name: 'show_timeslot_personas',
    joinColumn: {
      name: 'show_timeslot_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'persona_id',
      referencedColumnName: 'id',
    },
  })
  personas!: Persona[];


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

  @Column({ type: 'date', nullable: true })
  anchor_date!: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
