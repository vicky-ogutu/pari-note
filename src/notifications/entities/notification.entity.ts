import { Entity, PrimaryGeneratedColumn, Column, OneToOne, ManyToOne, OneToMany , JoinColumn, CreateDateColumn } from 'typeorm';
import { Baby } from '../../babies/entities/baby.entity';
import { Mother } from '../../mothers/entities/mother.entity';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  facilityName: string;

  @Column()
  mflCode: string;

  @Column({ type: 'date' })
  dateOfNotification: string;

  @Column()
  locality: string;

  @Column()
  county: string;

  @Column()
  subCounty: string;

  @Column()
  levelOfCare: string;

  @Column()
  managingAuthority: string;

  @OneToMany(() => Baby, (baby) => baby.notification, { cascade: true })
  babies: Baby[];

  @OneToOne(() => Mother, (mother) => mother.notification, { cascade: true })
  @JoinColumn()
  mother: Mother;
}
