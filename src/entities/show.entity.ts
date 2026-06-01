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
  id!: number;

  @Column({ type: 'varchar' })
  name!: string;

  @Column({ type: 'varchar' })
  catagory!: string;

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