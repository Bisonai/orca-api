import Decimal from "decimal.js"
import { Connection, PublicKey } from "@solana/web3.js"
import { TokenListProvider } from '@solana/spl-token-registry'
import { Network, OrcaPoolToken } from "@orca-so/sdk"

import { getPortfolio, toFullDenomination, getBalance } from "@bisonai-orca/solana_utils"
import { CONFIG } from "@bisonai-orca/config"

export async function getAllTokens(network: Network) {
    return await new TokenListProvider().resolve().then((tokens) => {
        return tokens.filterByClusterSlug(network).getList()
    })
}

export function getTokenAddress(token: OrcaPoolToken): string {
    return token.mint.toBase58()
}

export async function hasFunds(
    connection: Connection,
    publicKey: PublicKey,
    requiredAmount: Decimal,
): Promise<boolean> {
    const balance = new Decimal(toFullDenomination(
        await getBalance(connection, publicKey), CONFIG.SOL_DECIMALS))

    if (balance >= requiredAmount) {
        return true
    }
    else {
        return false
    }
}

export async function hasEnoughFunds(
    connection: Connection,
    publicKey: string,
    token: OrcaPoolToken,
    amount: Decimal,
    fee: Decimal,
): Promise<boolean> {
    // This function is mainly used by `@bisonai-orca/swap/swap`
    // TODO generalize
    const portfolio = await getPortfolio(connection, publicKey)

    const tokenAddress = getTokenAddress(token)

    const solBalance = new Decimal(
        toFullDenomination(portfolio.balance, CONFIG.SOL_DECIMALS))

    // SOL
    if (token.tag == "SOL") {
        if (solBalance >= amount.add(fee)) {
            return true
        }
        else {
            return false
        }
    }

    // splToken
    for (let splt of portfolio.splToken) {
        if (splt.mintAddress == tokenAddress) {
            const amountLamport = parseInt(splt.amount, CONFIG.DECIMAL_BASE)
            const balance = new Decimal(toFullDenomination(amountLamport, splt.decimals))

            if ((balance >= amount) && (solBalance >= fee)) {
                return true
            }
            else {
                return false
            }
        }
    }

    return false
}
