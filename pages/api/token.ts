import { getAllTokens } from "@bisonai-orca/orca_utils";
import { getNetwork, getConnection } from "@bisonai-orca/solana_utils";
import { addRpcEndpoint, extractParameter } from "@bisonai-orca/utils";
import type { NextApiRequest, NextApiResponse } from 'next'

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

    res.statusCode = 200
    res.setHeader("Content-Type", "application/json")
    res.end(JSON.stringify(tokens))
}
