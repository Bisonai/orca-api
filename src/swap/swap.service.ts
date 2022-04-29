import {
    Injectable,
    InternalServerErrorException,
    BadRequestException,
} from '@nestjs/common';
import { TransactionSignature } from '@solana/web3.js';
import { hasEnoughFunds } from '@bisonai-orca/orca-utils';
import { swap, getSwapQuote } from '@bisonai-orca/swap';
import { SwapInterface } from './interface/swap.interface';

@Injectable()
export class SwapService {
    async swap(i: SwapInterface): Promise<TransactionSignature> {
        if (
            !(await hasEnoughFunds(
                i.connection,
                i.keypair.publicKey,
                i.tokenFrom,
                i.tokenFromAmount,
                i.swapFee,
            ))
        ) {
            throw new BadRequestException({
                desription: 'Account does not have enough funds.',
            });
        }

        const swapQuote = await getSwapQuote(
            i.pool,
            i.tokenFrom,
            i.tokenFromAmount,
            i.slippage,
        );

        const swapTxPayload = await swap(i.pool, i.keypair, swapQuote);

        try {
            return await swapTxPayload.execute();
        } catch (error) {
            throw new InternalServerErrorException({
                description: error,
            });
        }
    }
}
