import { Connection, PublicKey } from "@solana/web3.js"
import { TOKEN_PROGRAM_ID } from "@solana/spl-token"
import { Network } from "@orca-so/sdk"
import { Keypair } from "@solana/web3.js"
import bs58 from "bs58"

interface SPLPortfolio {
    mintAddress: string
    amount: string
    decimals: number
}

interface Portfolio {
    balance: number
    splToken: SPLPortfolio[]
}

// TODO Move to orca utils
export function getNetwork(network: string): Network {
    if ((network != undefined) && Object.keys(Network).includes(network)) {
        return network as Network
    }
    else {
        return Network.DEVNET
    }
}

// TODO Move to orca utils
function getRpcEndpoint(network: string): string {
    if (network == Network.MAINNET) {
        return "https://api.mainnet-beta.solana.com"
    }
    else if (network == Network.DEVNET) {
        return "https://api.devnet.solana.com"
    }
    else {
        throw new Error(`${network} is not defined`)
    }
}

export function getConnection(_network: string): Connection {
    const network = getNetwork(_network)
    const rpcEndpoint = getRpcEndpoint(network)

    return new Connection(
        rpcEndpoint,
        "singleGossip",
    )
}

export function toSol(amount: number, decimals: number): number {
    return amount * (10 ** (-decimals))
}

async function getBalance(
    connection: Connection,
    pk: string,
): Promise<number> {
    return await connection.getBalance(new PublicKey(pk))
}

export async function getPortfolio(
    connection: Connection,
    pk: string,
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
                        bytes: pk,
                    },
                },
            ],
        }
    )

    const balance = await getBalance(connection, pk)

    let splToken: SPLPortfolio[] = []

    for (let acc of accounts) {
        const account: any = acc.account.data  // FIXME any
        const mintAddress = account.parsed.info.mint
        const amount = account.parsed.info.tokenAmount.amount
        const decimals = account.parsed.info.tokenAmount.decimals

        splToken.push({
            mintAddress,
            amount,
            decimals,
        })
    }

    const portfolio: Portfolio = {
        balance,
        splToken,
    }

    return portfolio
}

export function bs58SecretKeyFromKeypair(keypair: Keypair): string {
    return bs58.encode(keypair.secretKey)
}

export function bs58PublicKeyFromKeypair(keypair: Keypair): string {
    return bs58.encode(new Uint8Array(keypair.publicKey.toBytes()))
}

export function keypairFromB58(
    bs58PublicKey: string,
    bs58SecretKey: string,
): Keypair {
    const publicKey = bs58.decode(bs58PublicKey)
    const secretKey = bs58.decode(bs58SecretKey)
    return new Keypair({ publicKey, secretKey })
}
