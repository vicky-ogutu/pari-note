import { Module } from '@nestjs/common';
import { MothersService } from './mothers.service';
import { MothersController } from './mothers.controller';

@Module({
  controllers: [MothersController],
  providers: [MothersService],
})
export class MothersModule {}
