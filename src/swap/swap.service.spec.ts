import { Test, TestingModule } from '@nestjs/testing';
import { SwapService } from './swap.service';

describe('SwapService', () => {
    let service: SwapService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [SwapService],
        }).compile();

        service = module.get<SwapService>(SwapService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
