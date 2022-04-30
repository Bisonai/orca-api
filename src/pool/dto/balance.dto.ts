import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CONFIG } from '@bisonai-orca/config';

export class PoolBalanceDto {
    @IsNotEmpty()
    @ApiProperty({ enum: CONFIG.ALLOWED_NETWORKS })
    network: string;

    @IsNotEmpty()
    @ApiProperty({
        example: 'ETH'
    })
    tokenA: string;

    @IsNotEmpty()
    @ApiProperty({
        example: 'SOL'
    })
    tokenB: string;

    @IsNotEmpty()
    @ApiProperty({
        description: 'Base58 encoded public key'
    })
    publicKey: string;
}
