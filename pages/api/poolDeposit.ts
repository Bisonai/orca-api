import type { NextApiRequest, NextApiResponse } from "next"
import Decimal from "decimal.js"
import { OrcaPool, OrcaPoolToken, OrcaU64 } from "@orca-so/sdk"

import { getConnection } from "@bisonai-orca/solana_utils"
import { poolDeposit, getPoolDepositQuote, getPoolFromTokens } from "@bisonai-orca/pool";
import { extractParameter } from "@bisonai-orca/utils"
import { keypairFromBs58 } from "@bisonai-orca/solana_utils"
import { hasEnoughSPLFunds } from "@bisonai-orca/orca_utils"
import { getSwapQuote } from "@bisonai-orca/swap"
import { getTokenFromPool } from "@bisonai-orca/pool"

// TODO check if fnuds for fee (0.000015)

interface TokenAmountDeposits {
    tokenAAmount: Decimal | OrcaU64
    tokenBAmount: Decimal | OrcaU64
}

async function gaugeDepositAmountOfOtherToken(
    pool: OrcaPool,
    token: OrcaPoolToken,
    tokenAmount: Decimal,
): Promise<TokenAmountDeposits> {
    const poolToken = getTokenFromPool(pool, token.tag)
    const swapQuote = await getSwapQuote(
        pool,
        poolToken,
        tokenAmount,
    )

    const tokenAAmount = swapQuote.from.amount
    const tokenBAmount = swapQuote.to.amount

    return { tokenAAmount, tokenBAmount }
}

// Arguments
//   network
//   tokenA
//   tokenB
//   tokenAAmount
//   tokenBAmount
//   slippage (optional)
//   sk - secret key (temporary)
//   pk - public key (temporary)
// Returns
//   200 - OK
//   500
export default async (req: NextApiRequest, res: NextApiResponse) => {
    const networkParameter = extractParameter(req.query.network)
    // FIXME consider different token names
    const tokenA = extractParameter(req.query.tokenA)
    const tokenB = extractParameter(req.query.tokenB)
    const tokenAAmountParameter = extractParameter(req.query.tokenAAmount)
    const tokenBAmountParameter = extractParameter(req.query.tokenBAmount)

    // FIXME: pass already signed transaction instead
    const secretKey = extractParameter(req.query.sk)
    const publicKey = extractParameter(req.query.pk)

    const jsonHeader: [string, string] = ["Content-Type", "application/json"]

    const slippageParameter = req.query.slippage
    const slippageDefault = new Decimal(0.01)
    const slippage = (slippageParameter === undefined) ? slippageDefault : new Decimal(extractParameter(slippageParameter))

    try {
        const pool = getPoolFromTokens(
            networkParameter,
            tokenA,
            tokenB,
        )

        const orcaPoolTokenA = pool.getTokenA()
        const orcaPoolTokenB = pool.getTokenB()

        let orcaPoolTokenADeposit: string = ""
        let orcaPoolTokenBDeposit: string = ""

        if (orcaPoolTokenA.tag == tokenA) {
            orcaPoolTokenADeposit = tokenAAmountParameter
            orcaPoolTokenBDeposit = tokenBAmountParameter
        }
        else if (orcaPoolTokenA.tag == tokenB) {
            orcaPoolTokenADeposit = tokenBAmountParameter
            orcaPoolTokenBDeposit = tokenAAmountParameter
        }

        let tokenAmountDeposits: TokenAmountDeposits = {
            "tokenAAmount": new Decimal(0),
            "tokenBAmount": new Decimal(0),
        }

        if ((orcaPoolTokenADeposit === undefined) && (orcaPoolTokenBDeposit === undefined)) {
            res.
                status(400).
                setHeader(...jsonHeader).
                json({ "error": "At least one amount of token must be defined." })
            return
        }
        else if ((orcaPoolTokenADeposit !== undefined) && (orcaPoolTokenBDeposit !== undefined)) {
            const tokenAAmount = new Decimal(orcaPoolTokenADeposit)
            const tokenBAmount = new Decimal(orcaPoolTokenBDeposit)

            tokenAmountDeposits = {
                tokenAAmount,
                tokenBAmount,
            }
        }
        else if (orcaPoolTokenADeposit !== undefined) {
            tokenAmountDeposits = await gaugeDepositAmountOfOtherToken(
                pool,
                orcaPoolTokenA,
                new Decimal(orcaPoolTokenADeposit),
            )
        }
        else if (tokenBAmountParameter !== undefined) {
            tokenAmountDeposits = await gaugeDepositAmountOfOtherToken(
                pool,
                orcaPoolTokenB,
                new Decimal(orcaPoolTokenBDeposit),
            )
        }

        // FIXME: move outside of the execution REST API
        const keypair = keypairFromBs58(
            publicKey,
            secretKey,
        )

        const connection = getConnection(networkParameter)

        if (
            (!hasEnoughSPLFunds(connection, publicKey, orcaPoolTokenA, tokenAmountDeposits.tokenAAmount)) ||
            (!hasEnoughSPLFunds(connection, publicKey, orcaPoolTokenB, tokenAmountDeposits.tokenBAmount))
        ) {
            res.
                status(400).
                setHeader(...jsonHeader).
                json({ "error": "Account does not have enough funds." })
            return
        }

        const poolDepositQuote = await getPoolDepositQuote(
            pool,
            tokenAmountDeposits.tokenAAmount,
            tokenAmountDeposits.tokenBAmount,
            slippage,
        )

        const poolDepositTxPayload = await poolDeposit(
            pool,
            poolDepositQuote,
            keypair,
        )

        // TODO catch exceptions
        const poolDepositTxId = await poolDepositTxPayload.execute()

        res.
            status(200).
            setHeader(...jsonHeader).
            json({ "txId": poolDepositTxId })
    }
    catch (error) {
        res.status(500).
            setHeader(...jsonHeader).
            json({ error })
    }

}
