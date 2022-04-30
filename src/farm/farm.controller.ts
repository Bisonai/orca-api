import { Controller, Get, Post, Body, BadRequestException, HttpCode } from '@nestjs/common';
import { FarmService } from './farm.service';
import { getFarms } from '@bisonai-orca/farm';

@Controller('farm')
export class FarmController {
    constructor(private readonly farmService: FarmService) { }

    @Get()
    @HttpCode(200)
    async farm() {
        return getFarms();
    }
}
