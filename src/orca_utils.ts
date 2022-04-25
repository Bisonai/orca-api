import { Network } from "@orca-so/sdk"
import { TokenListProvider } from '@solana/spl-token-registry'

export async function getAllTokens(network: Network) {
    return await new TokenListProvider().resolve().then((tokens) => {
        return tokens.filterByClusterSlug(network).getList()
    })
}
