import { OrcaU64, OrcaPool, OrcaPoolToken } from "@orca-so/sdk"
import { Keypair } from "@solana/web3.js"
import Decimal from "decimal.js"

interface TokenQuote {
    token: OrcaPoolToken
    amount: Decimal | OrcaU64
}

interface SwapQuote {
    from: TokenQuote
    to: TokenQuote
}

export async function swap(
    pool: OrcaPool,
    keypair: Keypair,
    swapQuote: SwapQuote,
) {
    const swapTx = await pool.swap(
        keypair,
        swapQuote.from.token,
        swapQuote.from.amount,
        swapQuote.to.amount,
    )

    return swapTx
}

export async function getSwapQuote(
    pool: OrcaPool,
    tokenFrom: OrcaPoolToken,
    tokenFromAmount: Decimal | OrcaU64,
): Promise<SwapQuote> {
    let tokenTo

    const tokenA = pool.getTokenA()
    const tokenB = pool.getTokenB()

    if (tokenA == tokenFrom)
        tokenTo = tokenB
    else
        tokenTo = tokenA

    const quote = await pool.getQuote(
        tokenFrom,
        tokenFromAmount,
    )

    const tokenToAmount = quote.getMinOutputAmount()

    const swapQuote = {
        "from": {
            "token": tokenFrom,
            "amount": tokenFromAmount,
        },
        "to": {
            "token": tokenTo,
            "amount": tokenToAmount,
        }
    }

    return swapQuote
}

export function printSwapQuote(swapQuote: SwapQuote) {
    console.log(
        `${swapQuote.from.amount.toNumber()}`,
        `${swapQuote.from.token.tag}`,
        ` -> `,
        `${swapQuote.to.amount.toNumber()}`,
        `${swapQuote.to.token.tag}`
    )
}
