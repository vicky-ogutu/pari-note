import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { Baby } from '../babies/entities/baby.entity';
import { Mother } from '../mothers/entities/mother.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { Location } from '../locations/entities/location.entity';
import { User } from '../users/entities/user.entity';

import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotificationCreatedEvent } from './events/notification-created.event';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationsRepo: Repository<Notification>,

    @InjectRepository(Baby)
    private readonly babiesRepo: Repository<Baby>,

    @InjectRepository(Mother)
    private readonly mothersRepo: Repository<Mother>,

    @InjectRepository(Location)
    private readonly locationsRepo: Repository<Location>,

    private readonly eventEmitter: EventEmitter2,
  ) {}

  private async getParentUsers(locationId: number): Promise<User[]> {
  const users: User[] = [];

  let current = await this.locationsRepo.findOne({
    where: { id: locationId },
    relations: ['parent', 'users', 'parent.users'],
  });

  // include the current location's users first
  if (current?.users?.length) {
    users.push(...current.users);
  }

  // then walk up the parent chain
  while (current?.parent) {
    if (current.parent.users?.length) {
      users.push(...current.parent.users);
    }

    current = await this.locationsRepo.findOne({
      where: { id: current.parent.id },
      relations: ['parent', 'users', 'parent.users'],
    });
  }

  return Array.from(new Map(users.map(u => [u.id, u])).values());
}


  async createNotification(data: CreateNotificationDto) {
    const location = await this.locationsRepo.findOne({
      where: { id: data.locationId },
      relations: ['parent', 'users', 'parent.users'],
    });

    if (!location) {
      throw new NotFoundException(`Location with ID ${data.locationId} not found`);
    }

    const babies = data.babies?.map((b) => this.babiesRepo.create(b)) || [];
    const mother = this.mothersRepo.create(data.mother);

    const notification = this.notificationsRepo.create({
      dateOfNotification: data.dateOfNotification,
      location,
      babies,
      mother,
    });

    const saved = await this.notificationsRepo.save(notification);

    const parentUsers = await this.getParentUsers(location.id);

    this.eventEmitter.emit(
      'notification.created',
      new NotificationCreatedEvent(saved, parentUsers),
    );

    return saved;
  }

  async findAll() {
    return this.notificationsRepo.find({
      relations: ['location', 'babies', 'mother'],
    });
  }

  async findOne(id: number) {
    const notification = await this.notificationsRepo.findOne({
      where: { id },
      relations: ['location', 'babies', 'mother'],
    });

    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }

    return notification;
  }
}
