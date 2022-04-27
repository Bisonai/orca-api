import type { NextApiRequest, NextApiResponse } from "next"
import { getOrca } from "@orca-so/sdk"

import { getConnection, getNetwork, keypairFromBs58 } from "@bisonai-orca/solana_utils"
import { getPoolName, getPoolAddress } from "@bisonai-orca/pool"
import { extractParameter } from "@bisonai-orca/utils"
import { getWithdrawQuote, poolWithdraw } from "@bisonai-orca/pool";

// TODO check if enough funds for paying withdraw fees (0.000015 SOL)
// TODO check if there is anything to withdraw
// TODO pass signed transaction instead of pk & sk

// Arguments
//   network
//   tokenA
//   tokenB
//   sk - secret key (temporary)
//   pk - public key (temporary)
// Returns
//   200 - OK
//   500 - non-existant pool
export default async (req: NextApiRequest, res: NextApiResponse) => {
    const networkParameter = extractParameter(req.query.network)
    const tokenA = extractParameter(req.query.tokenA)
    const tokenB = extractParameter(req.query.tokenB)

    // FIXME: pass already signed transaction instead
    const secretKey = extractParameter(req.query.sk)
    const publicKey = extractParameter(req.query.pk)

    const jsonHeader: [string, string] = ["Content-Type", "application/json"]

    const network = getNetwork(networkParameter)
    const connection = getConnection(networkParameter)
    const orca = getOrca(connection, network)

    const poolName = getPoolName(tokenA, tokenB)

    if (poolName) {
        const poolAddress = getPoolAddress(poolName)
        const pool = orca.getPool(poolAddress)

        // FIXME: move outside of the execution REST API
        const keypair = keypairFromBs58(publicKey, secretKey)

        const withdrawQuote = await getWithdrawQuote(
            pool,
            keypair.publicKey,
        )

        const poolWithdrawTxPayload = await poolWithdraw(
            pool,
            keypair,
            withdrawQuote,
        )

        const poolWithdrawTxId = await poolWithdrawTxPayload.execute()

        res.
            status(200).
            setHeader(...jsonHeader).
            json({ "txId": poolWithdrawTxId })
    }
    else {
        const error = `Non-existent pool [${poolName}] with tokens [${tokenA}] and [${tokenB}].`
        res.status(500).
            setHeader(...jsonHeader).
            json({ error })
    }
}
