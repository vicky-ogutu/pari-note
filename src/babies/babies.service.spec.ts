import { Test, TestingModule } from '@nestjs/testing';
import { BabiesService } from './babies.service';

describe('BabiesService', () => {
  let service: BabiesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BabiesService],
    }).compile();

    service = module.get<BabiesService>(BabiesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
