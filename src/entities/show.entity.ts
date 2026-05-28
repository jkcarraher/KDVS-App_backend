import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity({name: 'shows'})
export class Show {
  @PrimaryGeneratedColumn()
  id!: number
  
  
  @Index({ unique: true })
  @Column({type: 'varchar'})
  spinitron_show_id!: string

  @Column({type: 'varchar'})
  name!: string;

  @Column({type: 'varchar'})
  catagory!: string;

  @Column({type: 'varchar'})
  spinitron_url!: string;

  @Column({type: 'varchar'})
  image_url!: string;

  @CreateDateColumn({
    type: 'date',
  })
  created_at!: string;
  @UpdateDateColumn({
    type: 'date',
  })
  updated_at!: string;
}