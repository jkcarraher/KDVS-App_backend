import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

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

  @CreateDateColumn({type: 'date'})
  created_at!: string;
}