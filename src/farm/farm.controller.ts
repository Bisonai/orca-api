import { Controller, Get, Post, Body, HttpCode } from '@nestjs/common';
import { PublicKey } from '@solana/web3.js';
import { FarmService } from './farm.service';
import { getFarms, getFarmFromTokens } from '@bisonai-orca/farm';
import { FarmBalanceDto } from './dto/farm-balance.dto';

@Controller('farm')
export class FarmController {
    constructor(private readonly farmService: FarmService) { }

    @Get()
    @HttpCode(200)
    async farm() {
        return getFarms();
    }

    @Post('balance')
    @HttpCode(200)
    async balance(@Body() dto: FarmBalanceDto) {
        const farm = getFarmFromTokens(
            dto.network,
            dto.tokenA,
            dto.tokenB,
            dto.farmType,
        );
        const publicKey = new PublicKey(dto.publicKey);
        return this.farmService.balance({
            farm,
            publicKey,
        });
    }
}
