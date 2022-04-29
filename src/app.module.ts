import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PoolController } from './pool/pool.controller';
import { PoolService } from './pool/pool.service';
import { PortfolioController } from './portfolio/portfolio.controller';
import { PortfolioService } from './portfolio/portfolio.service';
import { TokenController } from './token/token.controller';
import { TokenService } from './token/token.service';
import { SwapController } from './swap/swap.controller';
import { SwapService } from './swap/swap.service';

@Module({
    imports: [],
    controllers: [
        AppController,
        PoolController,
        PortfolioController,
        TokenController,
        SwapController,
    ],
    providers: [
        AppService,
        PoolService,
        PortfolioService,
        TokenService,
        SwapService,
    ],
})
export class AppModule {}
