import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { Baby } from '../babies/entities/baby.entity';
import { Mother } from '../mothers/entities/mother.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationsRepo: Repository<Notification>,

    @InjectRepository(Baby)
    private readonly babiesRepo: Repository<Baby>,

    @InjectRepository(Mother)
    private readonly mothersRepo: Repository<Mother>,
  ) {}

  async createNotification(data: CreateNotificationDto) {
  const babies = data.babies?.map((b) => this.babiesRepo.create(b)) || [];

  const mother = this.mothersRepo.create(data.mother);

  const notification = this.notificationsRepo.create({
    ...data,
    babies,
    mother,
  });

  return await this.notificationsRepo.save(notification);
}

  async findAll() {
    return this.notificationsRepo.find({ relations: ['baby', 'mother'] });
  }

  async findOne(id: number) {
    const notification = await this.notificationsRepo.findOne({
      where: { id },
      relations: ['baby', 'mother'],
    });

    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }

    return notification;
  }
}
