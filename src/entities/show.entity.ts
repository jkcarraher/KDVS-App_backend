import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'shows' })
export class Show {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: number;

  @Column({ type: 'varchar' })
  name!: string;

  @Column({ type: 'varchar' })
  catagory!: string;

  @Column('text', { array: true, default: () => "'{}'" })
  spinitron_ids!: string[];

  @Column({ type: 'varchar', nullable: true })
  image_url?: string;

  @CreateDateColumn({
    type: 'date',
  })
  created_at!: string;
  @UpdateDateColumn({
    type: 'date',
  })
  updated_at!: string;
}