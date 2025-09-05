import { Test, TestingModule } from '@nestjs/testing';
import { MothersService } from './mothers.service';

describe('MothersService', () => {
  let service: MothersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MothersService],
    }).compile();

    service = module.get<MothersService>(MothersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
