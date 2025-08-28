import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PariNote } from './entities/pari-note.entity';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ReportsService {
    constructor(
        @InjectRepository(PariNote) private repo: Repository<PariNote>,
        private notificationsService: NotificationsService,
    ) { }

    async create(reportDto: Partial<PariNote>) {
        const report = this.repo.create(reportDto);
        const saved = await this.repo.save(report);
        await this.notificationsService.notifyOnReport(saved);
        return saved;
    }

    async findAll(filter: any, pagination: { page: number; limit: number }) {
        const [data, total] = await this.repo.findAndCount({
            where: filter,
            take: pagination.limit,
            skip: (pagination.page - 1) * pagination.limit,
            relations: ['facility', 'reporter'],
        });
        return { data, total };
    }
}
