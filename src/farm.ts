import { Orca, OrcaPool, OrcaFarmConfig } from "@orca-so/sdk"
import { Keypair } from "@solana/web3.js"

function getFarms(): string[] {
    return Object.keys(OrcaFarmConfig)
}

export function getFarmTokens(): string[] {
    const farms = getFarms()
    const tokens = new Set(farms.flatMap(p => p.split("_").slice(0, 2)))
    // FIXME keep information about aqua farms and double dips
    return Array.from(tokens.values())
}

export async function farmDeposit(
    connection: Orca,
    farmId: OrcaFarmConfig,
    keypair: Keypair,
    pool: OrcaPool,
) {
    // Note 1: for double dip, repeat step 5 but with the double dip farm
    // Note 2: to harvest reward, orcaSolFarm.harvest(owner)
    // Note 3: to get harvestable reward amount, orcaSolFarm.getHarvestableAmount(owner.publicKey)

    const lpBalance = await pool.getLPBalance(keypair.publicKey)

    const farm = connection.getFarm(farmId)

    const farmDepositPayload = await farm.deposit(keypair, lpBalance)

    const farmDepositTxId = await farmDepositPayload.execute()

    console.log(`Farm deposited ${farmDepositTxId} "\n`)
}

export async function farmWithDraw(
    connection: Orca,
    farmId: OrcaFarmConfig,
    keypair: Keypair,
) {
    const farm = connection.getFarm(farmId)
    const farmBalance = await farm.getFarmBalance(keypair.publicKey) // withdraw the entire balance
    const farmWithdrawPayload = await farm.withdraw(keypair, farmBalance)
    const farmWithdrawTxId = await farmWithdrawPayload.execute()
    console.log(`Farm withdrawn ${farmWithdrawTxId} \n`)
}
