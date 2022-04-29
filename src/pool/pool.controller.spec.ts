import { Test, TestingModule } from '@nestjs/testing';
import { PoolController } from './pool.controller';
import { PoolService } from './pool.service';

describe('PoolController', () => {
    let controller: PoolController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [PoolController],
            providers: [PoolService],
        }).compile();

        controller = module.get<PoolController>(PoolController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
