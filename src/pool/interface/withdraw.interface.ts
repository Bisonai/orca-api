import { Keypair, Connection } from '@solana/web3.js';
import { OrcaPool } from '@orca-so/sdk';
import Decimal from 'decimal.js';

export interface WithdrawInterface {
    connection: Connection;
    keypair: Keypair;
    pool: OrcaPool;
    withdrawFee: Decimal;
}
