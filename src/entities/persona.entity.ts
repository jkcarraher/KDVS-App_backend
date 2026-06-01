import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity({name: 'personas'}) 
export class Persona {

  @PrimaryColumn({type: 'bigint'})
  id!: number;

  @Column({type: 'varchar'})
  name!: string;
  
}