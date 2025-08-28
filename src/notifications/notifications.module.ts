import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';
import { UserNotification } from './entities/user-notification.entity';
import { NotificationsService } from './notifications.service';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Notification, UserNotification]), UsersModule],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule { }
