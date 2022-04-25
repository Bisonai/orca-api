import type { NextApiRequest, NextApiResponse } from 'next'
import { getAllTokens } from "@bisonai-orca/orca_utils"
import { getNetwork, getConnection } from "@bisonai-orca/solana_utils"
import { addRpcEndpoint, extractParameter } from "@bisonai-orca/utils"

// Arguments
//   network
export default async (req: NextApiRequest, res: NextApiResponse) => {
    const networkParameter = extractParameter(req.query.network)

    const network = getNetwork(networkParameter)
    const connection = getConnection(networkParameter)
    const tokens = addRpcEndpoint(
        await getAllTokens(network),
        connection,
    )

    res.
        status(200).
        setHeader("Content-Type", "application/json").
        json(tokens)
}
