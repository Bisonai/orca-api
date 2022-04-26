import type { NextApiRequest, NextApiResponse } from 'next'
import Decimal from "decimal.js"

import { poolDeposit, getPoolDepositQuote, getPoolFromTokens } from "@bisonai-orca/pool";
import { extractParameter } from "@bisonai-orca/utils"
import { keypairFromBs58 } from "@bisonai-orca/solana_utils"
import { OrcaPool } from '@orca-so/sdk';

// TODO 50:50 add if only one amount set

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
export default async (req: NextApiRequest, res: NextApiResponse) => {
    const networkParameter = extractParameter(req.query.network)
    const tokenA = extractParameter(req.query.tokenA)
    const tokenB = extractParameter(req.query.tokenB)
    const tokenAAmount = new Decimal(extractParameter(req.query.tokenAAmount))
    const tokenBAmount = new Decimal(extractParameter(req.query.tokenBAmount))

    // FIXME: pass already signed transaction instead
    const secretKey = extractParameter(req.query.sk)
    const publicKey = extractParameter(req.query.pk)

    const jsonHeader: [string, string] = ["Content-Type", "application/json"]

    const slippageParameter = req.query.slippage
    const slippage = (slippageParameter === undefined) ? new Decimal(0.01) : new Decimal(extractParameter(slippageParameter))

    try {
        const pool = getPoolFromTokens(
            networkParameter,
            tokenA,
            tokenB,
        )

        // FIXME: move outside of the execution REST API
        const keypair = keypairFromBs58(
            publicKey,
            secretKey,
        )

        const poolDepositQuote = await getPoolDepositQuote(
            pool,
            tokenAAmount,
            tokenBAmount,
            slippage,
        )

        const poolDepositTxPayload = await poolDeposit(
            pool,
            poolDepositQuote,
            keypair,
        )
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
