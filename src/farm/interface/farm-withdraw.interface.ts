import { OrcaFarm } from '@orca-so/sdk';
import { Keypair } from '@solana/web3.js';

export interface FarmWithdrawInterface {
    farm: OrcaFarm;
    keypair: Keypair;
}
