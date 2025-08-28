import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PariNote } from './entities/pari-note.entity';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [TypeOrmModule.forFeature([PariNote]), NotificationsModule],
  providers: [ReportsService],
  controllers: [ReportsController],
})
export class ReportsModule { }
