import type { NextApiRequest, NextApiResponse } from "next"
import { PublicKey } from "@solana/web3.js"

import { extractParameter } from "@bisonai-orca/utils"
import { getWithdrawQuote, getPoolFromTokens, withdrawQuoteToJSON } from "@bisonai-orca/pool";

// Arguments
//   network
//   tokenA
//   tokenB
//   pk - public key
// Returns
//   200 - OK
//   500
export default async (req: NextApiRequest, res: NextApiResponse) => {
    const networkParameter = extractParameter(req.query.network)
    const tokenA = extractParameter(req.query.tokenA)
    const tokenB = extractParameter(req.query.tokenB)
    const publicKey = new PublicKey(extractParameter(req.query.pk))

    const jsonHeader: [string, string] = ["Content-Type", "application/json"]

    try {
        const pool = getPoolFromTokens(
            networkParameter,
            tokenA,
            tokenB,
        )

        const balance = await getWithdrawQuote(
            pool,
            publicKey,
        )

        res.
            status(200).
            setHeader(...jsonHeader).
            json(balance)
    }
    catch (error) {
        res.status(500).
            setHeader(...jsonHeader).
            json({ error })
    }
}
