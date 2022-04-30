import { OrcaFarm, OrcaPool } from '@orca-so/sdk';
import { Keypair } from '@solana/web3.js';

export interface FarmDepositInterface {
    farm: OrcaFarm;
    pool: OrcaPool;
    keypair: Keypair;
}
