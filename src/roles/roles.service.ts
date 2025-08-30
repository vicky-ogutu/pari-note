import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';

@Injectable()
export class RolesService {
    constructor(
        @InjectRepository(Role)
        private readonly roleRepo: Repository<Role>,
    ) { }

    async findAll(): Promise<Role[]> {
        return this.roleRepo.find();
    }

    async findByName(name: string): Promise<Role | null> {
        return this.roleRepo.findOne({ where: { name } });
    }

    async findById(id: number): Promise<Role | null> {
        return this.roleRepo.findOne({ where: { id } });
    }

    async create(role: Partial<Role>): Promise<Role> {
        return this.roleRepo.save(role);
    }
}
