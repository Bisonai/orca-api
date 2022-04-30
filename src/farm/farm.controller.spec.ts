import { Test, TestingModule } from '@nestjs/testing';
import { FarmController } from './farm.controller';
import { FarmService } from './farm.service';

describe('FarmController', () => {
    let controller: FarmController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [FarmController],
            providers: [FarmService],
        }).compile();

        controller = module.get<FarmController>(FarmController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
