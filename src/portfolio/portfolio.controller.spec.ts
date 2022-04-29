import { Test, TestingModule } from '@nestjs/testing';
import { PortfolioController } from './portfolio.controller';
import { PortfolioService } from './portfolio.service';

describe('PortfolioController', () => {
    let controller: PortfolioController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [PortfolioController],
            providers: [PortfolioService],
        }).compile();

        controller = module.get<PortfolioController>(PortfolioController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
