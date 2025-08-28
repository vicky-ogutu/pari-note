import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Notification } from './notification.entity';
import { User } from '../../users/entities/user.entity';

@Entity('user_notifications')
export class UserNotification {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Notification)
    @JoinColumn({ name: 'notification_id' })
    notification: Notification;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ default: false })
    isRead: boolean;

    @CreateDateColumn()
    createdAt: Date;
}
