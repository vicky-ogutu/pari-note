import { Test, TestingModule } from '@nestjs/testing';
import { BabiesController } from './babies.controller';
import { BabiesService } from './babies.service';

describe('BabiesController', () => {
  let controller: BabiesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BabiesController],
      providers: [BabiesService],
    }).compile();

    controller = module.get<BabiesController>(BabiesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
