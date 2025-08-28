import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, TreeRepository, Tree } from 'typeorm';
import { Location } from './entities/location.entity';

@Injectable()
export class LocationsService {
    constructor(
        @InjectRepository(Location) private locRepo: Repository<Location>,
    ) { }

    findTree() {
        return this.locRepo.find({ relations: ['children'] });
    }
}
