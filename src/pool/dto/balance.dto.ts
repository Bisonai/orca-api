import { IsNotEmpty } from 'class-validator';

export class BalanceDto {
    @IsNotEmpty()
    network: string;

    @IsNotEmpty()
    tokenA: string;

    @IsNotEmpty()
    tokenB: string;

    @IsNotEmpty()
    publicKey: string;
}
