import { OrcaFarm } from '@orca-so/sdk';
import { PublicKey } from '@solana/web3.js';

export interface FarmBalanceInterface {
    farm: OrcaFarm;
    publicKey: PublicKey;
}
