import { IsNotEmpty } from 'class-validator';

export class DepositDto {
    @IsNotEmpty()
    network: string;

    @IsNotEmpty()
    tokenA: string; // TODO change name

    @IsNotEmpty()
    tokenB: string; // TODO change name

    @IsNotEmpty()
    tokenAAmount: number;

    @IsNotEmpty()
    tokenBAmount: number;

    slippage: number;

    @IsNotEmpty()
    publicKey: string;

    @IsNotEmpty()
    secretKey: string;
}
