import { Keypair, Connection } from '@solana/web3.js';
import Decimal from 'decimal.js';
import { OrcaPool, OrcaPoolToken } from '@orca-so/sdk';

export interface DepositInterface {
    connection: Connection;
    keypair: Keypair;
    pool: OrcaPool;
    tokenA: OrcaPoolToken;
    tokenB: OrcaPoolToken;
    tokenAAmount: Decimal;
    tokenBAmount: Decimal;
    slippage: Decimal;
    depositFee: Decimal;
}
