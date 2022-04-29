import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import {
    getPoolName,
    getPoolAddress,
    getTokenFromPool,
} from '@bisonai-orca/pool';
import { getOrca } from '@orca-so/sdk';
import {
    getConnection,
    getNetwork,
    keypairFromBs58,
} from '@bisonai-orca/solana-utils';
import { getSlippage } from '@bisonai-orca/orca-utils';
import Decimal from 'decimal.js';
import { CONFIG } from '@bisonai-orca/config';
import { SwapDto } from './dto/swap.dto';
import { SwapService } from './swap.service';

@Controller('swap')
export class SwapController {
    constructor(private readonly swapService: SwapService) {}

    @Post()
    async balance(@Body() dto: SwapDto) {
        const poolName = getPoolName(dto.tokenFrom, dto.tokenTo);

        if (poolName) {
            // FIXME: move outside of the execution REST API
            const keypair = keypairFromBs58(dto.publicKey, dto.secretKey);
            const connection = getConnection(dto.network);
            const orca = getOrca(connection, getNetwork(dto.network));

            const poolAddress = getPoolAddress(poolName);
            const pool = orca.getPool(poolAddress);
            const tokenFrom = getTokenFromPool(pool, dto.tokenFrom);
            const tokenFromAmount = new Decimal(dto.tokenFromAmount);
            const slippage = getSlippage(dto.slippage);
            const swapFee = CONFIG.SWAP_FEE;

            return this.swapService.swap({
                connection,
                keypair,
                pool,
                tokenFrom,
                tokenFromAmount,
                slippage,
                swapFee,
            });
        }

        throw new BadRequestException({
            desription: `Non-existent pool with tokens [${dto.tokenFrom}] and [${dto.tokenTo}].`,
        });
    }
}
