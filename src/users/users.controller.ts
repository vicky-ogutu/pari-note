import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { UsersService } from './users.service';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService) { }

    @Post('register')
    async register(@Body() body: any) {
        return this.usersService.create(body);
    }

    @UseGuards(JwtAuthGuard)
    @Get('profile')
    async profile(@Request() req) {
        return this.usersService.findById(req.user.id);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @Get()
    async findAll() {
        return this.usersService.findAll();
    }
}
