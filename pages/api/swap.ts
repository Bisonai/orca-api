import { getOrca } from "@orca-so/sdk"
import Decimal from "decimal.js"
import { getConnection, getNetwork, keypairFromB58 } from "@bisonai-orca/solana_utils"
import { swap, getSwapQuote } from "@bisonai-orca/swap"
import { getPoolName, getPoolAddress, getTokenFromPool } from "@bisonai-orca/pool"
import type { NextApiRequest, NextApiResponse } from 'next'
import { extractParameter } from "@bisonai-orca/utils"

// Arguments
//   network
//   tokenA
//   tokenB
//   tokenAAmount
// Returns
//   200
//   500
export default async (req: NextApiRequest, res: NextApiResponse) => {
    const networkParameter = extractParameter(req.query.network)
    const tokenA = extractParameter(req.query.tokenA)
    const tokenB = extractParameter(req.query.tokenB)
    const tokenAAmount = extractParameter(req.query.tokenAAmount)

    // FIXME: pass already signed transaction instead
    const secretKey = extractParameter(req.query.sk)
    const publicKey = extractParameter(req.query.pk)

    const network = getNetwork(networkParameter)
    const connection = getConnection(networkParameter)
    const orca = getOrca(connection, network)

    const poolName = getPoolName(tokenA, tokenB)

    const jsonHeader: [string, string] = ["Content-Type", "application/json"]

    if (poolName) {
        const poolAddress = getPoolAddress(poolName)
        const pool = orca.getPool(poolAddress)
        const tokenFrom = getTokenFromPool(pool, tokenA)

        // TODO: check if enough balance
        const tokenFromAmount = new Decimal(tokenAAmount)

        const swapQuote = await getSwapQuote(
            pool,
            tokenFrom,
            tokenFromAmount,
        )

        // FIXME: move outside of the execution REST API
        const keypair = keypairFromB58(publicKey, secretKey)

        const swapTxPayload = await swap(
            pool,
            keypair,
            swapQuote,
        )

        try {
            const swapTxId = await swapTxPayload.execute()
            res.
                status(200).
                setHeader(...jsonHeader).
                json({ swapTxId })
        } catch (error) {
            res.status(500).
                setHeader(...jsonHeader).
                json({ error })
        }
    }
    else {
        const error = `Non-existent pool [${poolName}] with tokens [${tokenA}] and [${tokenB}].`
        res.status(500).
            setHeader(...jsonHeader).
            json({ error })
    }
}
