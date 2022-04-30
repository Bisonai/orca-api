import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { FarmBalanceInterface } from './interface/farm-balance.interface';
import { FarmDepositInterface } from './interface/farm-deposit.interface';
import { farmDeposit } from '@bisonai-orca/farm';


@Injectable()
export class FarmService {
    async balance(i: FarmBalanceInterface) {
        return await i.farm.getFarmBalance(i.publicKey);
    }

    async deposit(i: FarmDepositInterface) {
        try {
            // Deposit every LP token from pool to farm.
            const farmDepositTxPayload = await farmDeposit(
                i.farm,
                i.pool,
                i.keypair,
            );

            return await farmDepositTxPayload.execute();
        } catch (error) {
            throw new InternalServerErrorException({
                description: error,
            });
        }
    }
}
