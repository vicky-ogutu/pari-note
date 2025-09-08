import { Entity, PrimaryGeneratedColumn, Column, OneToOne, ManyToOne, OneToMany , JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Baby } from '../../babies/entities/baby.entity';
import { Mother } from '../../mothers/entities/mother.entity';
import { Location } from '../../locations/entities/location.entity';
import { User } from '../../users/entities/user.entity';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date' })
  dateOfNotification: string;

  @ManyToOne(() => Location, { eager: true })
  @JoinColumn({ name: 'location_id' })
  location: Location;

  @OneToMany(() => Baby, (baby) => baby.notification, { cascade: true })
  babies: Baby[];

  @OneToOne(() => Mother, (mother) => mother.notification, { cascade: true })
  @JoinColumn({
    name: 'mother_id',
    foreignKeyConstraintName: 'fk_notifications_mother',
  })
  mother: Mother;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({
    name: 'created_by',
    foreignKeyConstraintName: 'fk_notifications_user',
  })
  createdBy: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
