import { IsNotEmpty } from 'class-validator';

export class SwapDto {
    @IsNotEmpty()
    network: string;

    @IsNotEmpty()
    tokenFrom: string;

    @IsNotEmpty()
    tokenTo: string;

    @IsNotEmpty()
    tokenFromAmount: number;

    slippage: number;

    @IsNotEmpty()
    publicKey: string;

    @IsNotEmpty()
    secretKey: string;
}
