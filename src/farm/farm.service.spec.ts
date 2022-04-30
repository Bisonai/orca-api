import { Test, TestingModule } from '@nestjs/testing';
import { FarmService } from './farm.service';

describe('FarmService', () => {
    let service: FarmService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [FarmService],
        }).compile();

        service = module.get<FarmService>(FarmService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
