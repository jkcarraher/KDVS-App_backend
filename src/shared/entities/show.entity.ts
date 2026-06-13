import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryColumn,
} from 'typeorm';

@Entity({ name: 'shows' })
export class Show {
  @PrimaryColumn({ type: 'bigint' })
  id!: string;

  @Column({ type: 'varchar' })
  name!: string;

  @Column({ type: 'varchar' })
  category!: string;

  @Column({ type: 'varchar', nullable: true })
  image_url?: string;

  @Column({ type: 'varchar', length: 7, nullable: true })
  color?: string;

  @CreateDateColumn({
    type: 'date',
  })
  created_at!: string;
  @UpdateDateColumn({
    type: 'date',
  })
  updated_at!: string;
}