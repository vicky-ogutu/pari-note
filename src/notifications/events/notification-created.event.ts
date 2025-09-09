import { Notification } from '../entities/notification.entity';
import { User } from 'src/users/entities/user.entity';

export class NotificationCreatedEvent {
  constructor(
    public readonly notification: Notification,
    public readonly parentUsers: User[],
  ) {}
}
