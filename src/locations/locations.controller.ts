import { Controller, Get } from '@nestjs/common';
import { LocationsService } from './locations.service';

@Controller('locations')
export class LocationsController {
    constructor(private locService: LocationsService) { }

    @Get('tree')
    getTree() {
        return this.locService.findTree();
    }
}
