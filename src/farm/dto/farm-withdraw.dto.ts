import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CONFIG } from '@bisonai-orca/config';

export class FarmWithdrawtDto {
    @IsNotEmpty()
    @ApiProperty({ enum: CONFIG.ALLOWED_NETWORKS })
    network: string;

    @IsNotEmpty()
    @ApiProperty({ enum: ['DD', 'AQ'] })
    farmType: string;

    @IsNotEmpty()
    @ApiProperty({
        example: 'mSOL'
    })
    tokenA: string; // TODO change name

    @IsNotEmpty()
    @ApiProperty({
        example: 'USDT'
    })
    tokenB: string; // TODO change name

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
