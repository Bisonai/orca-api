import { PublicKey } from '@solana/web3.js';

export interface BalanceInterface {
    network: string;
    tokenA: string;
    tokenB: string;
    publicKey: PublicKey;
}
