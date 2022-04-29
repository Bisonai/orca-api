import { Connection, PublicKey, Keypair } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { Network } from '@orca-so/sdk';
import bs58 from 'bs58';

interface SplPortfolio {
    mintAddress: string;
    ownerAddress: string;
    amount: string;
    decimals: number;
}

export interface Portfolio {
    balance: number;
    splToken: SplPortfolio[];
}

// TODO Move to orca utils
export function getNetwork(network: string): Network {
    if (network != undefined && Object.keys(Network).includes(network)) {
        return network as Network;
    }

    return Network.DEVNET;
}

// TODO Move to orca utils
function getRpcEndpoint(network: string): string {
    if (network === Network.MAINNET) {
        return 'https://api.mainnet-beta.solana.com';
    }

    if (network === Network.DEVNET) {
        return 'https://api.devnet.solana.com';
    }

    throw new Error(`${network} is not defined`);
}

export function getConnection(_network: string): Connection {
    const network = getNetwork(_network);
    const rpcEndpoint = getRpcEndpoint(network);

    return new Connection(rpcEndpoint, 'singleGossip');
}

export function toFullDenomination(amount: number, decimals: number): number {
    return amount * 10 ** -decimals;
}

export async function getBalance(
    connection: Connection,
    publicKey: PublicKey,
): Promise<number> {
    return connection.getBalance(publicKey);
}

export async function getPortfolio(
    connection: Connection,
    publicKey: PublicKey,
): Promise<Portfolio> {
    const accounts = await connection.getParsedProgramAccounts(
        TOKEN_PROGRAM_ID,
        {
            filters: [
                {
                    dataSize: 165,
                },
                {
                    memcmp: {
                        offset: 32,
                        bytes: publicKey.toBase58(),
                    },
                },
            ],
        },
    );

    const balance = await getBalance(connection, publicKey);

    const splToken: SplPortfolio[] = [];

    for (const acc of accounts) {
        const account: any = acc.account.data; // FIXME any
        const mintAddress = account.parsed.info.mint;
        const ownerAddress = account.parsed.info.owner;
        const amount = account.parsed.info.tokenAmount.amount;
        const decimals = account.parsed.info.tokenAmount.decimals;

        splToken.push({
            mintAddress,
            ownerAddress,
            amount,
            decimals,
        });
    }

    const portfolio: Portfolio = {
        balance,
        splToken,
    };

    return portfolio;
}

export function bs58SecretKeyFromKeypair(keypair: Keypair): string {
    return bs58.encode(keypair.secretKey);
}

export function bs58PublicKeyFromKeypair(keypair: Keypair): string {
    return bs58.encode(new Uint8Array(keypair.publicKey.toBytes()));
}

export function keypairFromBs58(
    bs58PublicKey: string,
    bs58SecretKey: string,
): Keypair {
    const publicKey = bs58.decode(bs58PublicKey);
    const secretKey = bs58.decode(bs58SecretKey);
    return new Keypair({ publicKey, secretKey });
}
