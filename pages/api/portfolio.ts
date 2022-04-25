import { getConnection, getPortfolio } from "@bisonai-orca/solana_utils"
import { addRpcEndpoint, extractParameter } from "@bisonai-orca/utils"
import type { NextApiRequest, NextApiResponse } from 'next'

// Arguments
//   network
//   pk
export default async (req: NextApiRequest, res: NextApiResponse) => {
    const network = extractParameter(req.query.network)
    const pk = extractParameter(req.query.pk)

    const connection = getConnection(network)
    const portfolio = addRpcEndpoint(
        await getPortfolio(connection, pk),
        connection,
    )

    res.
        status(200).
        setHeader("Content-Type", "application/json").
        json(portfolio)
}
