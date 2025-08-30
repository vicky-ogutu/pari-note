import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { RolesService } from './roles.service';
import { Role } from './entities/role.entity';

@Controller('roles')
export class RolesController {
    constructor(private readonly rolesService: RolesService) { }

    @Get()
    async findAll(): Promise<Role[]> {
        return this.rolesService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: number): Promise<Role | null> {
        return this.rolesService.findById(id);
    }

    @Post()
    async create(@Body() role: Partial<Role>): Promise<Role> {
        return this.rolesService.create(role);
    }
}
