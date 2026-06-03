import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity({name: 'personas'}) 
export class Persona {

  @PrimaryColumn({type: 'bigint'})
  id!: string;

  @Column({type: 'varchar'})
  name!: string;
  
}