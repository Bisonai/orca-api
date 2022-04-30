import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CONFIG } from '@bisonai-orca/config';

export class DepositDto {
    @IsNotEmpty()
    @ApiProperty({ enum: CONFIG.ALLOWED_NETWORKS })
    network: string;

    @IsNotEmpty()
    @ApiProperty({
        example: 'ETH'
    })
    tokenA: string; // TODO change name

    @IsNotEmpty()
    @ApiProperty({
        example: 'SOL'
    })
    tokenB: string; // TODO change name

    @IsNotEmpty()
    @ApiProperty({
        minimum: 0.0,
        exclusiveMinimum: true,
    })
    tokenAAmount: number;

    @IsNotEmpty()
    @ApiProperty({
        minimum: 0.0,
        exclusiveMinimum: true,
    })
    tokenBAmount: number;

    @ApiProperty({
        description: 'Maximum difference between a trade’s expected price and the actual price',
        minimum: 0.0,
        maximum: 1.0,
        exclusiveMinimum: true,
        default: CONFIG.SLIPPAGE,
        required: false
    })
    slippage: number;

    @IsNotEmpty()
    @ApiProperty({
        description: 'Base58 encoded public key'
    })
    publicKey: string;

    @IsNotEmpty()
    @ApiProperty({
        description: 'Base58 encoded secret key'
    })
    secretKey: string;
}
