import type { NextApiRequest, NextApiResponse } from 'next'
import Decimal from "decimal.js"
import { getOrca } from "@orca-so/sdk"

import { getConnection, getNetwork, keypairFromBs58 } from "@bisonai-orca/solana_utils"
import { swap, getSwapQuote } from "@bisonai-orca/swap"
import { getPoolName, getPoolAddress, getTokenFromPool } from "@bisonai-orca/pool"
import { extractParameter } from "@bisonai-orca/utils"
import { hasEnoughFunds } from "@bisonai-orca/orca_utils"
import { CONFIG } from "@bisonai-orca/config"

// Arguments
//   network
//   tokenA
//   tokenB
//   tokenAAmount
//   sk - secret key (temporary)
//   pk - public key (temporary)
// Returns
//   200 - OK
//   400 - not enough funds
//   500 - non-existant pool
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

        const tokenFromAmount = new Decimal(tokenAAmount)

        const enough = await hasEnoughFunds(
            connection,
            publicKey,
            tokenFrom,
            tokenFromAmount,
            CONFIG.SWAP_FEE,
        )
        if (!enough) {
            res.
                status(400).
                setHeader(...jsonHeader).
                json({ "error": "Account has not enough funds." })
            return
        }

        const swapQuote = await getSwapQuote(
            pool,
            tokenFrom,
            tokenFromAmount,
        )

        // FIXME: move outside of the execution REST API
        const keypair = keypairFromBs58(publicKey, secretKey)

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
