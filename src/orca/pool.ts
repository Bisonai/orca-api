import Decimal from 'decimal.js';
import { Keypair, PublicKey } from '@solana/web3.js';
import { getConnection, getNetwork } from '@bisonai-orca/solana-utils';
import {
    TransactionPayload,
    getOrca,
    OrcaU64,
    OrcaPool,
    OrcaPoolToken,
    OrcaPoolConfig,
    DepositQuote,
    WithdrawQuote,
} from '@orca-so/sdk';

function poolNameExist(poolName: string): boolean {
    const keys = Object.keys(OrcaPoolConfig);
    if (keys.find((x) => x === poolName) === undefined) {
        return false;
    }

    return true;
}

function poolFromTokens(tokenA: string, tokenB: string): string {
    return `${tokenA}_${tokenB}`;
}

function getPools(): string[] {
    return Object.keys(OrcaPoolConfig);
}

export function getPoolFromTokens(
    network: string,
    tokenA: string,
    tokenB: string,
): OrcaPool {
    const poolName = getPoolName(tokenA, tokenB);

    if (poolName) {
        // Unify required `network` and `networkShortcut`
        const networkShortcut = getNetwork(network);
        const connection = getConnection(network);
        const poolAddress = getPoolAddress(poolName);
        const orca = getOrca(connection, networkShortcut);
        return orca.getPool(poolAddress);
    }

    throw new Error(`There is no pool with [${tokenA}] and [${tokenB}].`);
}

export function getTokenFromPool(pool: OrcaPool, token: string): OrcaPoolToken {
    const tokenA = pool.getTokenA();
    const tokenB = pool.getTokenB();

    const tokenATag = tokenA.tag;
    const tokenBTag = tokenB.tag;

    if (token === tokenATag) {
        return tokenA;
    }

    if (token === tokenBTag) {
        return tokenB;
    }

    throw new Error(`Token ${token} is not part of pool ${pool}.`);
}

export function getPoolName(
    tokenA: string,
    tokenB: string,
): string | undefined {
    const poolAB = poolFromTokens(tokenA, tokenB);
    const poolBA = poolFromTokens(tokenB, tokenA);

    if (poolNameExist(poolAB)) {
        return poolAB;
    }

    if (poolNameExist(poolBA)) {
        return poolBA;
    }

    return undefined;
}

export function getPoolAddress(poolName: string): OrcaPoolConfig {
    // Call `poolNameExist` before
    return OrcaPoolConfig[poolName as keyof typeof OrcaPoolConfig];
}

export function getPoolTokens(): string[] {
    const pools = getPools();
    const tokens = new Set(pools.flatMap((p) => p.split('_')));
    return Array.from(tokens.values());
}

export async function getPoolDepositQuote(
    pool: OrcaPool,
    tokenAAmount: Decimal | OrcaU64,
    tokenBAmount: Decimal | OrcaU64,
    slippage: Decimal,
): Promise<DepositQuote> {
    return pool.getDepositQuote(tokenAAmount, tokenBAmount, slippage);
}

export async function poolDeposit(
    pool: OrcaPool,
    poolDepositQuote: DepositQuote,
    keypair: Keypair,
): Promise<TransactionPayload> {
    return await pool.deposit(
        keypair,
        poolDepositQuote.maxTokenAIn,
        poolDepositQuote.maxTokenBIn,
        poolDepositQuote.minPoolTokenAmountOut,
    );
}

export async function getWithdrawQuote(
    pool: OrcaPool,
    publicKey: PublicKey,
): Promise<WithdrawQuote> {
    const withdrawTokenAmount = await pool.getLPBalance(publicKey);
    const withdrawTokenMint = pool.getPoolTokenMint();

    return pool.getWithdrawQuote(withdrawTokenAmount, withdrawTokenMint);
}

export async function poolWithdraw(
    pool: OrcaPool,
    keypair: Keypair,
    withdrawQuote: WithdrawQuote,
): Promise<TransactionPayload> {
    return pool.withdraw(
        keypair,
        withdrawQuote.maxPoolTokenAmountIn,
        withdrawQuote.minTokenAOut,
        withdrawQuote.minTokenBOut,
    );
}

export function isDepositedPool(withdrawQuote: WithdrawQuote): boolean {
    // Test if there are any funds defined by `WithdrawQuote` left to
    // withdraw from pool.
    if (
        withdrawQuote.maxPoolTokenAmountIn.toNumber() === 0 &&
        withdrawQuote.minTokenAOut.toNumber() === 0 &&
        withdrawQuote.minTokenBOut.toNumber() === 0
    ) {
        return false;
    }

    return true;
}
