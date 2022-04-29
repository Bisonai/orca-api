import { IsNotEmpty } from 'class-validator';

export class WithdrawDto {
    @IsNotEmpty()
    network: string;

    @IsNotEmpty()
    tokenA: string;

    @IsNotEmpty()
    tokenB: string;

    @IsNotEmpty()
    publicKey: string;

    @IsNotEmpty()
    secretKey: string;
}
