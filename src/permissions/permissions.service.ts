import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from './entities/permission.entity';

@Injectable()
export class PermissionsService {
    constructor(
        @InjectRepository(Permission)
        private permissionRepository: Repository<Permission>,
    ) { }

    async findAll(): Promise<Permission[]> {
        return this.permissionRepository.find();
    }

    async findOne(id: number): Promise<Permission | null> {
        return this.permissionRepository.findOne({ where: { id } });
    }

    async create(permissionData: Partial<Permission>): Promise<Permission> {
        const permission = this.permissionRepository.create(permissionData);
        return this.permissionRepository.save(permission);
    }
}