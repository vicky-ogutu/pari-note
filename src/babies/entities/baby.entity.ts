import { Entity, PrimaryGeneratedColumn, JoinColumn, Column, ManyToOne } from 'typeorm';
import { Notification } from '../../notifications/entities/notification.entity';

@Entity('babies')
export class Baby {

 @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date' })
  dateOfDeath: Date;

  @Column({ nullable: true })
  timeOfDeath: string;

  @Column({ nullable: true })
  gestationWeeks: number;

  @Column()
  outcome: string;

  @Column({ nullable: true })
  apgarScore1min: string;

  @Column({ nullable: true })
  apgarScore5min: string;

  @Column({ nullable: true })
  apgarScore10min: string;

  @Column({ nullable: true })
  ageAtDeathDays: number;

  @Column({ nullable: true })
  birthWeight: number;

  @Column()
  sex: string;

   @ManyToOne(() => Notification, (notification) => notification.babies, { onDelete: 'CASCADE' })
   @JoinColumn({
    name: 'notification_id',
    foreignKeyConstraintName: 'fk_babies_notification',
  })
  notification: Notification;
}
