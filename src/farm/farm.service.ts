import { Injectable } from '@nestjs/common';
import { FarmBalanceInterface } from './interface/farm-balance.interface';


@Injectable()
export class FarmService {
    balance(i: FarmBalanceInterface) {
        return i.farm.getFarmBalance(i.publicKey);
    }
}
