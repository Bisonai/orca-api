import { Injectable } from '@nestjs/common';
import { FarmBalanceInterface } from './interface/farm-balance.interface';


@Injectable()
export class FarmService {
    async balance(i: FarmBalanceInterface) {
        return await i.farm.getFarmBalance(i.publicKey);
    }
}
