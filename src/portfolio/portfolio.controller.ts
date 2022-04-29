import { Controller, Post, Body } from '@nestjs/common';
import { PublicKey } from '@solana/web3.js';
import { getConnection } from '@bisonai-orca/solana-utils';
import { PortfolioDto } from './dto/portfolio.dto';
import { PortfolioService } from './portfolio.service';

@Controller('portfolio')
export class PortfolioController {
    constructor(private readonly portfolioService: PortfolioService) {}

    @Post()
    async balance(@Body() portfolioDto: PortfolioDto) {
        const publicKey = new PublicKey(portfolioDto.publicKey);
        const connection = getConnection(portfolioDto.network);

        return this.portfolioService.portfolio({
            connection,
            publicKey,
        });
    }
}
