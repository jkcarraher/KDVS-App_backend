import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Show } from "./show.entity";


@Entity({ name: 'show_notification_subscription' })
@Index(['deviceToken', 'showId'], { unique: true })
export class NotificationSubscription {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: string;

  @Column()
  deviceToken!: string;

  @ManyToOne(() => Show, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({name:'showId'})
  show!: Show;

  @Column()
  showId!: string;

  @CreateDateColumn()
  createdAt!: Date;
}