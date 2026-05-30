import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: 'seasons'})
export class Season {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: number;

  @Column({type: 'varchar'})
  name!: string;
  
  @Column({type: 'date'})
  start_date!: string;

  @Column({type: 'date'})
  end_date!: string;

  @Column({type: 'boolean', default: false})
  is_auto_generated!: boolean;

  @CreateDateColumn({type: 'date'})
  created_at!: string;

  @UpdateDateColumn()
  updated_at!: Date;
}