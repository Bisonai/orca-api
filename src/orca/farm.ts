import { TransactionPayload, getOrca, OrcaPool, OrcaFarm, OrcaFarmConfig } from '@orca-so/sdk';
import { Keypair } from '@solana/web3.js';
import { getConnection, getNetwork } from '@bisonai-orca/solana-utils';

export function getFarms(): string[] {
    return Object.keys(OrcaFarmConfig);
}

export function getFarmAddress(farmName: string): OrcaFarmConfig {
    return OrcaFarmConfig[farmName as keyof typeof OrcaFarmConfig];
}

export function getFarmTokens(): string[] {
    const farms = getFarms();
    const tokens = new Set(farms.flatMap((p) => p.split('_').slice(0, 2)));
    // FIXME keep information about aqua farms and double dips
    return Array.from(tokens.values());
}

export function getFarmFromTokens(
    network: string,
    tokenA: string,
    tokenB: string,
    farmType: string,
): OrcaFarm {
    const farmName = getFarmName(tokenA, tokenB, farmType);

    if (farmName) {
        // Unify required `network` and `networkShortcut`
        const networkShortcut = getNetwork(network);
        const connection = getConnection(network);
        const farmAddress = getFarmAddress(farmName);
        const orca = getOrca(connection, networkShortcut);
        return orca.getFarm(farmAddress);
    }

    throw new Error(`There is no [$[farmType]] farm with [${tokenA}], [${tokenB}] tokens.`);
}

function farmNameExist(farmName: string): boolean {
    const keys = Object.keys(OrcaFarmConfig);
    if (keys.find((x) => x === farmName) === undefined) {
        return false;
    }

    return true;
}

function farmFromTokens(
    tokenA: string,
    tokenB: string,
    farmType: string, // FIXME use enum
): string {
    return `${tokenA}_${tokenB}_${farmType}`;
}

export function getFarmName(
    tokenA: string,
    tokenB: string,
    farmType: string,
): string | undefined {
    const farmAB = farmFromTokens(tokenA, tokenB, farmType);
    const farmBA = farmFromTokens(tokenB, tokenA, farmType);

    if (farmNameExist(farmAB)) {
        return farmAB;
    }
    else if (farmNameExist(farmBA)) {
        return farmBA;
    }
    else {
        return undefined;
    }
}

export async function farmDeposit(
    farm: OrcaFarm,
    pool: OrcaPool,
    keypair: Keypair,
): Promise<TransactionPayload> {
    // Note 1: for double dip, repeat step 5 but with the double dip farm
    // Note 2: to harvest reward, orcaSolFarm.harvest(owner)
    // Note 3: to get harvestable reward amount, orcaSolFarm.getHarvestableAmount(owner.publicKey)
    const lpBalance = await pool.getLPBalance(keypair.publicKey);
    // TODO use `baseTokenAmount`
    return await farm.deposit(keypair, lpBalance);
}

export async function farmWithdraw(
    farm: OrcaFarm,
    keypair: Keypair,
): Promise<TransactionPayload> {
    // Withdraw the entire balance
    const farmBalance = await farm.getFarmBalance(keypair.publicKey);
    // TODO use `baseTokenAmount`
    return await farm.withdraw(keypair, farmBalance);
}
