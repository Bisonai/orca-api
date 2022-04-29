import Decimal from 'decimal.js';
import { Connection, PublicKey } from '@solana/web3.js';
import { TokenListProvider } from '@solana/spl-token-registry';
import { Network, OrcaPoolToken, OrcaU64 } from '@orca-so/sdk';

import {
    getPortfolio,
    toFullDenomination,
    getBalance,
} from '@bisonai-orca/solana-utils';
import { CONFIG } from '@bisonai-orca/config';

export async function getAllTokens(network: Network) {
    return new TokenListProvider()
        .resolve()
        .then((tokens) => tokens.filterByClusterSlug(network).getList());
}

export function getTokenAddress(token: OrcaPoolToken): string {
    return token.mint.toBase58();
}

export async function hasFunds(
    connection: Connection,
    publicKey: PublicKey,
    requiredAmount: Decimal,
): Promise<boolean> {
    const balance = new Decimal(
        toFullDenomination(
            await getBalance(connection, publicKey),
            CONFIG.SOL_DECIMALS,
        ),
    );

    if (balance >= requiredAmount) {
        return true;
    }

    return false;
}

export async function hasEnoughSPLFunds(
    connection: Connection,
    publicKey: PublicKey,
    token: OrcaPoolToken,
    amount: OrcaU64 | Decimal, // FIXME stop using Decimal
): Promise<boolean> {
    const tokenAddress = getTokenAddress(token);
    const portfolio = await getPortfolio(connection, publicKey);

    for (const splt of portfolio.splToken) {
        if (splt.mintAddress === tokenAddress) {
            // FIXME stop using Decimal
            const splTokenAmount = Number.parseInt(
                splt.amount,
                CONFIG.DECIMAL_BASE,
            );
            const balance = new Decimal(
                toFullDenomination(splTokenAmount, splt.decimals),
            );

            if (balance >= amount) {
                return true;
            }

            return false;
        }
    }

    return false;
}

export async function hasEnoughFunds(
    connection: Connection,
    publicKey: PublicKey,
    token: OrcaPoolToken,
    amount: Decimal,
    fee: Decimal,
): Promise<boolean> {
    // This function is mainly used by `@bisonai-orca/swap/swap`
    // TODO generalize
    const portfolio = await getPortfolio(connection, publicKey);

    const tokenAddress = getTokenAddress(token);

    const solBalance = new Decimal(
        toFullDenomination(portfolio.balance, CONFIG.SOL_DECIMALS),
    );

    // SOL
    if (token.tag === 'SOL') {
        if (solBalance >= amount.add(fee)) {
            return true;
        }

        return false;
    }

    // SplToken
    for (const splt of portfolio.splToken) {
        if (splt.mintAddress === tokenAddress) {
            const amountLamport = Number.parseInt(
                splt.amount,
                CONFIG.DECIMAL_BASE,
            );
            const balance = new Decimal(
                toFullDenomination(amountLamport, splt.decimals),
            );

            if (balance >= amount && solBalance >= fee) {
                return true;
            }

            return false;
        }
    }

    return false;
}

export function getSlippage(slippage: number): Decimal {
    if (slippage === undefined) {
        return CONFIG.SLIPPAGE;
    }

    return new Decimal(slippage);
}

export function alignPoolTokensAndAmounts(
    tokenA: OrcaPoolToken,
    tokenATag: string,
    tokenAAmount: number,
    tokenBAmount: number,
) {
    if (tokenA.tag === tokenATag) {
        return [new Decimal(tokenAAmount), new Decimal(tokenBAmount)];
    }

    return [new Decimal(tokenBAmount), new Decimal(tokenAAmount)];
}
