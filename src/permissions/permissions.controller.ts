import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { Permission } from './entities/permission.entity';

@Controller('permissions')
export class PermissionsController {
    constructor(private readonly permissionsService: PermissionsService) { }

    @Get()
    findAll(): Promise<Permission[]> {
        return this.permissionsService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string): Promise<Permission | null> {
        return this.permissionsService.findOne(+id);
    }

    @Post()
    create(@Body() permissionData: Partial<Permission>): Promise<Permission> {
        return this.permissionsService.create(permissionData);
    }
}