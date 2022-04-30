import { Controller, Post, Body, BadRequestException, HttpCode } from '@nestjs/common';
import { PublicKey } from '@solana/web3.js';
import { keypairFromBs58, getConnection } from '@bisonai-orca/solana-utils';
import { getPoolFromTokens } from '@bisonai-orca/pool';
import { CONFIG } from '@bisonai-orca/config';
import {
    getSlippage,
    alignPoolTokensAndAmounts,
} from '@bisonai-orca/orca-utils';
import { PoolService } from './pool.service';
import { WithdrawDto } from './dto/withdraw.dto';
import { DepositDto } from './dto/deposit.dto';
import { BalanceDto } from './dto/balance.dto';

@Controller('pool')
export class PoolController {
    constructor(private readonly poolService: PoolService) { }

    @Post('balance')
    @HttpCode(200)
    async balance(@Body() dto: BalanceDto) {
        return this.poolService.balance({
            network: dto.network,
            tokenA: dto.tokenA,
            tokenB: dto.tokenB,
            publicKey: new PublicKey(dto.publicKey),
        });
    }

    @Post('deposit')
    @HttpCode(200)
    async deposit(@Body() dto: DepositDto) {
        const connection = getConnection(dto.network);

        // FIXME: move outside of the execution REST API
        const keypair = keypairFromBs58(dto.publicKey, dto.secretKey);

        const pool = getPoolFromTokens(dto.network, dto.tokenA, dto.tokenB);

        const tokenA = pool.getTokenA();
        const tokenB = pool.getTokenB();
        const [tokenAAmount, tokenBAmount] = alignPoolTokensAndAmounts(
            tokenA,
            dto.tokenA,
            dto.tokenAAmount,
            dto.tokenBAmount,
        );

        const slippage = getSlippage(dto.slippage);

        const depositFee = CONFIG.POOL_DEPOSIT_FEE;

        return this.poolService.deposit({
            connection,
            keypair,
            pool,
            tokenA,
            tokenB,
            tokenAAmount,
            tokenBAmount,
            slippage,
            depositFee,
        });
    }

    @Post('withdraw')
    @HttpCode(200)
    async withdraw(@Body() dto: WithdrawDto) {
        try {
            const connection = getConnection(dto.network);

            // FIXME: move outside of the execution REST API
            const keypair = keypairFromBs58(dto.publicKey, dto.secretKey);

            const pool = getPoolFromTokens(dto.network, dto.tokenA, dto.tokenB);

            const withdrawFee = CONFIG.WITHDRAW_FEE;

            return await this.poolService.withdraw({
                connection,
                keypair,
                pool,
                withdrawFee,
            });
        } catch (error) {
            throw new BadRequestException({
                description: error,
            });
        }
    }
}
