import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MothersService } from './mothers.service';
import { CreateMotherDto } from './dto/create-mother.dto';
import { UpdateMotherDto } from './dto/update-mother.dto';

@Controller('mothers')
export class MothersController {
  constructor(private readonly mothersService: MothersService) {}

  @Post()
  create(@Body() createMotherDto: CreateMotherDto) {
    return this.mothersService.create(createMotherDto);
  }

  @Get()
  findAll() {
    return this.mothersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.mothersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMotherDto: UpdateMotherDto) {
    return this.mothersService.update(+id, updateMotherDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.mothersService.remove(+id);
  }
}
