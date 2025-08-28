import { Controller, Post, Body, Get, Query, UseGuards, Request } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { PaginationPipe } from '../common/pipes/pagination.pipe';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
    constructor(private reportsService: ReportsService) { }

    @Post()
    async create(@Body() body: any, @Request() req) {
        return this.reportsService.create({ ...body, reporter: req.user });
    }

    @Get()
    async findAll(
        @Query('page', PaginationPipe) pagination: { page: number; limit: number },
    ) {
        return this.reportsService.findAll({}, pagination);
    }
}
