import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CONFIG } from '@bisonai-orca/config';

export class SwapDto {
    @IsNotEmpty()
    @ApiProperty({ enum: CONFIG.ALLOWED_NETWORKS })
    network: string;

    @IsNotEmpty()
    @ApiProperty({
        example: 'ETH'
    })
    tokenFrom: string;

    @IsNotEmpty()
    @ApiProperty({
        example: 'SOL'
    })
    tokenTo: string;

    @IsNotEmpty()
    @ApiProperty({
        minimum: 0.0,
        exclusiveMinimum: true,
    })
    tokenFromAmount: number;

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
