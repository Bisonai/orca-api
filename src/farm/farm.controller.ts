import { Controller, Get, Post, Body, HttpCode } from '@nestjs/common';
import { PublicKey } from '@solana/web3.js';
import { FarmService } from './farm.service';
import { getFarms, getFarmFromTokens } from '@bisonai-orca/farm';
import { getPoolFromTokens } from '@bisonai-orca/pool';
import { FarmBalanceDto } from './dto/farm-balance.dto';
import { FarmDepositDto } from './dto/farm-deposit.dto';
import { FarmWithdrawtDto } from './dto/farm-withdraw.dto';
import { keypairFromBs58 } from '@bisonai-orca/solana-utils';

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
        return await this.farmService.balance({
            farm,
            publicKey,
        });
    }

    @Post('deposit')
    @HttpCode(200)
    async deposit(@Body() dto: FarmDepositDto) {
        const pool = getPoolFromTokens(
            dto.network,
            dto.tokenA,
            dto.tokenB,
        );
        const farm = getFarmFromTokens(
            dto.network,
            dto.tokenA,
            dto.tokenB,
            dto.farmType,
        );

        // FIXME: move outside of the execution REST API
        const keypair = keypairFromBs58(dto.publicKey, dto.secretKey);

        return await this.farmService.deposit({
            farm,
            pool,
            keypair,
        });
    }

    @Post('withdraw')
    @HttpCode(200)
    async withdraw(@Body() dto: FarmWithdrawtDto) {
        const farm = getFarmFromTokens(
            dto.network,
            dto.tokenA,
            dto.tokenB,
            dto.farmType,
        );

        // FIXME: move outside of the execution REST API
        const keypair = keypairFromBs58(dto.publicKey, dto.secretKey);

        return await this.farmService.withdraw({
            farm,
            keypair,
        });
    }
}
