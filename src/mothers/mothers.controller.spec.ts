import { Test, TestingModule } from '@nestjs/testing';
import { MothersController } from './mothers.controller';
import { MothersService } from './mothers.service';

describe('MothersController', () => {
  let controller: MothersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MothersController],
      providers: [MothersService],
    }).compile();

    controller = module.get<MothersController>(MothersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
