import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
} from 'typeorm';

@Entity({ name: 'shows' })
export class Show {
  @PrimaryGeneratedColumn({
    type: 'int',
    name: 'id',
  })
  id: number;

  @Column({
    type: 'varchar',
    length: 255,
    default: 'CHILDREN OF THE CORN',
  })
  name: string;

  @Column({
    type: 'varchar',
    length: 255,
    default: 'DJ JAWN',
  })
  dj_name: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  show_url: string | null;

  @Column({
    type: 'text',
    nullable: true,
  })
  playlist_image_url: string | null;

  @Column({
    type: 'varchar',
    length: 7,
    nullable: true,
  })
  show_color: string | null;

  @Column({
    type: 'time',
    default: () => 'now()',
  })
  end_time: string;

  @Column({
    type: 'varchar',
    length: 10,
    default: 'Funday',
  })
  current_dotw: string;

  @Column({
    type: 'text',
    array: true,
    default: () => "'{}'",
  })
  show_dates: string[];

  @Column({
    type: 'time',
    default: () => 'now()',
  })
  start_time: string;

  @Column({
    type: 'date',
    default: () => 'now()',
  })
  first_show_date: string;

  @Column({
    type: 'date',
    default: () => 'now()',
  })
  last_show_date: string;

  @Column({
    type: 'boolean',
    default: false,
  })
  alternates: boolean;
}