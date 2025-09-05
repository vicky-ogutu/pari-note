import { Injectable } from '@nestjs/common';
import { CreateMotherDto } from './dto/create-mother.dto';
import { UpdateMotherDto } from './dto/update-mother.dto';

@Injectable()
export class MothersService {
  create(createMotherDto: CreateMotherDto) {
    return 'This action adds a new mother';
  }

  findAll() {
    return `This action returns all mothers`;
  }

  findOne(id: number) {
    return `This action returns a #${id} mother`;
  }

  update(id: number, updateMotherDto: UpdateMotherDto) {
    return `This action updates a #${id} mother`;
  }

  remove(id: number) {
    return `This action removes a #${id} mother`;
  }
}
