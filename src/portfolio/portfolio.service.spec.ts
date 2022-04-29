import { Test, TestingModule } from '@nestjs/testing';
import { PortfolioService } from './portfolio.service';

describe('PortfolioService', () => {
    let service: PortfolioService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [PortfolioService],
        }).compile();

        service = module.get<PortfolioService>(PortfolioService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
