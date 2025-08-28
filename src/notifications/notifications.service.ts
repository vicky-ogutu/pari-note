import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { UserNotification } from './entities/user-notification.entity';
import { UsersService } from '../users/users.service';
import { PariNote } from 'src/reports/entities/pari-note.entity';

@Injectable()
export class NotificationsService {
    constructor(
        @InjectRepository(Notification) private notifRepo: Repository<Notification>,
        @InjectRepository(UserNotification) private userNotifRepo: Repository<UserNotification>,
        private usersService: UsersService,
    ) { }

    async notifyOnReport(report: PariNote) {
        const message = `New stillbirth report submitted at facility ${report.facility.id}`;
        const notif = await this.notifRepo.save({
            report,
            message,
            location: report.facility,
        });

        // Notify all users in that facility
        // (Extend logic to fetch hierarchical users by location)
        const users = await this.usersService.findByLocation(report.facility.id);
        for (const user of users) {
            await this.userNotifRepo.save({
                notification: notif,
                user,
            });
        }
    }
}
