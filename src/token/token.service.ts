import { Injectable } from '@nestjs/common';
import { getAllTokens } from '@bisonai-orca/orca-utils';
import { TokenInfo } from '@solana/spl-token-registry';
import { TokenInterface } from './interface/token.interface';

@Injectable()
export class TokenService {
    async token(i: TokenInterface): Promise<TokenInfo[]> {
        return getAllTokens(i.network);
    }
}
