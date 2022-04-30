import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { getNetwork } from '@bisonai-orca/solana-utils';
import { TokenService } from './token.service';
import { TokenDto } from './dto/token.dto';

@Controller('token')
export class TokenController {
    constructor(private readonly tokenService: TokenService) { }

    @Post()
    @HttpCode(200)
    async balance(@Body() dto: TokenDto) {
        const network = getNetwork(dto.network);
        return this.tokenService.token({
            network,
        });
    }
}
