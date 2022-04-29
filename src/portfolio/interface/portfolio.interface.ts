import { PublicKey, Connection } from '@solana/web3.js';

export interface PortfolioInterface {
    connection: Connection;
    publicKey: PublicKey;
}
