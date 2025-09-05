import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BabiesService } from './babies.service';
import { CreateBabyDto } from './dto/create-baby.dto';
import { UpdateBabyDto } from './dto/update-baby.dto';

@Controller('babies')
export class BabiesController {
  constructor(private readonly babiesService: BabiesService) {}

  @Post()
  create(@Body() createBabyDto: CreateBabyDto) {
    return this.babiesService.create(createBabyDto);
  }

  @Get()
  findAll() {
    return this.babiesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.babiesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBabyDto: UpdateBabyDto) {
    return this.babiesService.update(+id, updateBabyDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.babiesService.remove(+id);
  }
}
