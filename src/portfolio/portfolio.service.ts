import { Injectable } from '@nestjs/common';
import { getPortfolio, Portfolio } from '@bisonai-orca/solana-utils';
import { PortfolioInterface } from './interface/portfolio.interface';

@Injectable()
export class PortfolioService {
    async portfolio(i: PortfolioInterface): Promise<Portfolio> {
        return getPortfolio(i.connection, i.publicKey);
    }
}
