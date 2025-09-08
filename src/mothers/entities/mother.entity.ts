import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, OneToOne, OneToMany } from 'typeorm';
import { Notification } from '../../notifications/entities/notification.entity';

@Entity('mothers')
export class Mother {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  age: number;

  @Column()
  married: boolean;

  @Column()
  parity: string;

  @Column()
  outcome: string;

  @Column()
  typeOfPregnancy: string;

  @Column()
  attendedAntenatal: string;

  @Column()
    placeOfDelivery: string;

    @Column()
    facilityLevelOfCare: string;

    @Column()
    typeOfDelivery: string;

    @Column()
    periodOfDeath: string;

    @Column()
    perinatalCause: string;

    @Column()
    maternalCondition: string;

  @Column('simple-array', { nullable: true })
  conditions: string[];

  @OneToOne(() => Notification, (notification) => notification.mother)
  notification: Notification;
}

