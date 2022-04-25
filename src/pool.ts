import { OrcaU64, OrcaPool, OrcaPoolToken, OrcaPoolConfig } from "@orca-so/sdk"
import { Keypair } from "@solana/web3.js"
import Decimal from "decimal.js"

function poolNameExist(pool_name: string): boolean {
    const keys = Object.keys(OrcaPoolConfig);
    if (keys.find(x => x == pool_name) == undefined)
        return false;
    else
        return true;
}

function poolFromTokens(
    tokenA: string,
    tokenB: string,
): string {
    return `${tokenA}_${tokenB}`;
}

function getPools(): string[] {
    return Object.keys(OrcaPoolConfig);
}

// EXPORT
export function getTokenFromPool(
    pool: OrcaPool,
    token: string,
): OrcaPoolToken {
    const tokenA = pool.getTokenA();
    const tokenB = pool.getTokenB();

    const tokenATag = tokenA.tag;
    const tokenBTag = tokenB.tag;

    if (token == tokenATag)
        return tokenA;
    else if (token == tokenBTag)
        return tokenB;
    else
        throw new Error(`Token ${token} is not part of pool ${pool}.`);
}

export function getPoolName(
    tokenA: string,
    tokenB: string,
): string | undefined {
    const poolAB = poolFromTokens(tokenA, tokenB);
    const poolBA = poolFromTokens(tokenB, tokenA);

    if (poolNameExist(poolAB))
        return poolAB;
    else if (poolNameExist(poolBA))
        return poolBA;
    else
        return undefined;
}

export function getPoolAddress(
    pool_name: string,
): OrcaPoolConfig {
    /// call `poolNameExist` before
    return OrcaPoolConfig[pool_name as keyof typeof OrcaPoolConfig];
}

export function getPoolTokens(): string[] {
    const pools = getPools();
    const tokens = new Set(pools.flatMap(p => p.split("_")));
    return Array.from(tokens.values());
}

export async function poolDeposit(
    keypair: Keypair,
    pool: OrcaPool,
    tokenAAmount: Decimal | OrcaU64,
    tokenBAmount: Decimal | OrcaU64,
) {
    const slippage = new Decimal(0.01); // FIXME
    const { maxTokenAIn, maxTokenBIn, minPoolTokenAmountOut } = await pool.getDepositQuote(
        tokenAAmount,
        tokenBAmount,
        slippage,
    );

    console.log(`token A ${maxTokenAIn.toNumber()}`);
    console.log(`token B ${maxTokenBIn.toNumber()}`);
    console.log(`LP tokens ${minPoolTokenAmountOut.toNumber()}`);

    const poolDepositPayload = await pool.deposit(
        keypair,
        maxTokenAIn,
        maxTokenBIn,
        minPoolTokenAmountOut,
    );

    // FIXME delete
    console.log(poolDepositPayload)

    // const poolDepositTxId = await poolDepositPayload.execute();
    // console.log(`Pool deposited ${poolDepositTxId} \n`);
}

export async function poolWithdraw(
    pool: OrcaPool,
    keypair: Keypair,
) {
    const withdrawTokenAmount = await pool.getLPBalance(keypair.publicKey);
    const withdrawTokenMint = pool.getPoolTokenMint();
    const { maxPoolTokenAmountIn, minTokenAOut, minTokenBOut } = await pool.getWithdrawQuote(
        withdrawTokenAmount,
        withdrawTokenMint
    );

    console.log(
        `Withdraw at most ${maxPoolTokenAmountIn.toNumber()} ORCA_SOL LP token for at least ${minTokenAOut.toNumber()} ORCA and ${minTokenBOut.toNumber()} SOL`
    );

    const poolWithdrawPayload = await pool.withdraw(
        keypair,
        maxPoolTokenAmountIn,
        minTokenAOut,
        minTokenBOut
    );

    const poolWithdrawTxId = await poolWithdrawPayload.execute();
    console.log(`Pool withdrawn poolWithdrawTxId \n`);
}
