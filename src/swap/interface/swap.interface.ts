import { Connection, Keypair } from '@solana/web3.js';
import { OrcaPool, OrcaPoolToken } from '@orca-so/sdk';
import Decimal from 'decimal.js';

export interface SwapInterface {
    connection: Connection;
    keypair: Keypair;
    pool: OrcaPool;
    tokenFrom: OrcaPoolToken;
    tokenFromAmount: Decimal;
    slippage: Decimal;
    swapFee: Decimal;
}
