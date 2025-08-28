import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User) private usersRepo: Repository<User>,
    ) { }

    create(user: Partial<User>) {
        return this.usersRepo.save(user);
    }

    findByEmail(email: string) {
        return this.usersRepo.findOne({ where: { email } });
    }

    findById(id: number) {
        return this.usersRepo.findOne({ where: { id }, relations: ['location'] });
    }

    findByLocation(locationId: number) {
        return this.usersRepo.find({
            where: { location: { id: locationId } },
            relations: ['location'],
        });
    }

    findAll() {
        return this.usersRepo.find({
            relations: ['location'],
        });
    }
}

