import Decimal from "decimal.js"
import { Keypair } from "@solana/web3.js"
import { getConnection, getNetwork } from "@bisonai-orca/solana_utils"
import { getOrca, OrcaU64, OrcaPool, OrcaPoolToken, OrcaPoolConfig, DepositQuote } from "@orca-so/sdk"

function poolNameExist(pool_name: string): boolean {
    const keys = Object.keys(OrcaPoolConfig)
    if (keys.find(x => x == pool_name) == undefined)
        return false
    else
        return true
}

function poolFromTokens(
    tokenA: string,
    tokenB: string,
): string {
    return `${tokenA}_${tokenB}`
}

function getPools(): string[] {
    return Object.keys(OrcaPoolConfig)
}

export function getPoolFromTokens(
    network: string,
    tokenA: string,
    tokenB: string,
): OrcaPool {
    const poolName = getPoolName(tokenA, tokenB)

    if (poolName) {
        // unify required `network` and `network_shortcut`
        const network_shortcut = getNetwork(network)
        const connection = getConnection(network)
        const poolAddress = getPoolAddress(poolName)

        const orca = getOrca(connection, network_shortcut)
        return orca.getPool(poolAddress)
    }
    else {
        throw new Error(`There is no pool with [${tokenA}] and [${tokenB}]`)
    }
}

export function getTokenFromPool(
    pool: OrcaPool,
    token: string,
): OrcaPoolToken {
    const tokenA = pool.getTokenA()
    const tokenB = pool.getTokenB()

    const tokenATag = tokenA.tag
    const tokenBTag = tokenB.tag

    if (token == tokenATag)
        return tokenA
    else if (token == tokenBTag)
        return tokenB
    else
        throw new Error(`Token ${token} is not part of pool ${pool}.`)
}

export function getPoolName(
    tokenA: string,
    tokenB: string,
): string | undefined {
    const poolAB = poolFromTokens(tokenA, tokenB)
    const poolBA = poolFromTokens(tokenB, tokenA)

    if (poolNameExist(poolAB))
        return poolAB
    else if (poolNameExist(poolBA))
        return poolBA
    else
        return undefined
}

export function getPoolAddress(
    pool_name: string,
): OrcaPoolConfig {
    // call `poolNameExist` before
    return OrcaPoolConfig[pool_name as keyof typeof OrcaPoolConfig]
}

export function getPoolTokens(): string[] {
    const pools = getPools()
    const tokens = new Set(pools.flatMap(p => p.split("_")))
    return Array.from(tokens.values())
}

export async function getPoolDepositQuote(
    pool: OrcaPool,
    tokenAAmount: Decimal | OrcaU64,
    tokenBAmount: Decimal | OrcaU64,
    slippage: Decimal,
): Promise<DepositQuote> {
    return await pool.getDepositQuote(
        tokenAAmount,
        tokenBAmount,
        slippage,
    )
}

export async function poolDeposit(
    pool: OrcaPool,
    poolDepositQuote: DepositQuote,
    keypair: Keypair,
) {
    const poolDepositTx = await pool.deposit(
        keypair,
        poolDepositQuote.maxTokenAIn,
        poolDepositQuote.maxTokenBIn,
        poolDepositQuote.minPoolTokenAmountOut,
    )

    return poolDepositTx
}

export async function poolWithdraw(
    pool: OrcaPool,
    keypair: Keypair,
) {
    const withdrawTokenAmount = await pool.getLPBalance(keypair.publicKey)
    const withdrawTokenMint = pool.getPoolTokenMint()
    const { maxPoolTokenAmountIn, minTokenAOut, minTokenBOut } = await pool.getWithdrawQuote(
        withdrawTokenAmount,
        withdrawTokenMint
    )

    console.log(
        `Withdraw at most ${maxPoolTokenAmountIn.toNumber()} ORCA_SOL LP token for at least ${minTokenAOut.toNumber()} ORCA and ${minTokenBOut.toNumber()} SOL`
    )

    const poolWithdrawPayload = await pool.withdraw(
        keypair,
        maxPoolTokenAmountIn,
        minTokenAOut,
        minTokenBOut
    )

    const poolWithdrawTxId = await poolWithdrawPayload.execute()
    console.log(`Pool withdrawn poolWithdrawTxId \n`)
}
