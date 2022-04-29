import { Test, TestingModule } from '@nestjs/testing';
import { SwapController } from './swap.controller';
import { SwapService } from './swap.service';

describe('SwapController', () => {
    let controller: SwapController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [SwapController],
            providers: [SwapService],
        }).compile();

        controller = module.get<SwapController>(SwapController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
