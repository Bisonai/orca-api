import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CONFIG } from '@bisonai-orca/config';

export class TokenDto {
    @IsNotEmpty()
    @ApiProperty({ enum: CONFIG.ALLOWED_NETWORKS })
    network: string;
}
