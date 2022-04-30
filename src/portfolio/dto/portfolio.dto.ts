import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CONFIG } from '@bisonai-orca/config';

export class PortfolioDto {
    @IsNotEmpty()
    @ApiProperty({ enum: CONFIG.ALLOWED_NETWORKS })
    network: string;

    @IsNotEmpty()
    @ApiProperty({
        description: 'Base58 encoded public key'
    })
    publicKey: string;
}
