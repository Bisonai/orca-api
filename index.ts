import { readFile, writeFile } from "mz/fs";
import { Connection, Keypair } from "@solana/web3.js";
import { Orca, OrcaU64, OrcaPool, OrcaPoolToken, getOrca, OrcaFarmConfig, OrcaPoolConfig } from "@orca-so/sdk";
import Decimal from "decimal.js";


// Missing APY, volume
// EXPLORE OrcaPool
// * getPoolTokenMint
// * getLPBalance
// * getLPSupply
// * getQuoteWithPoolAmounts

/* ACCOUNT
   let keypair = generateKeypair();
   saveKeypair(keypair);
   keypair = await loadKeypair();
*/

const getPools: () => string[] = function () {
  return Object.keys(OrcaPoolConfig);
};

const getPoolTokens: () => string[] = function () {
  const pools = getPools();
  const tokens = new Set(pools.flatMap(p => p.split("_")));
  return Array.from(tokens.values());
};

const getFarms: () => string[] = function () {
  return Object.keys(OrcaFarmConfig);
};

const getFarmTokens: () => string[] = function () {
  const farms = getFarms();
  const tokens = new Set(farms.flatMap(p => p.split("_").slice(0, 2)));
  // FIXME keep information about aqua farms and double dips
  return Array.from(tokens.values());
};

const generateKeypair: () => Keypair = function () {
  return Keypair.generate();
};

const saveKeypair: (keypair: Keypair, keypairPath?: string) => void = async function (
  keypair,
  keypairPath = "secret-key.json",
) {
  const secretKey = "[" + keypair.secretKey.toString() + "]";
  await writeFile(keypairPath, secretKey, {
    encoding: "utf8",
  });
}

const loadKeypair: (secretkeyPath?: string) => Promise<Keypair> = async function (
  secretkeyPath = "secret-key.json",
) {
  const secretKeyString = await readFile(secretkeyPath, {
    encoding: "utf8",
  });
  const secretKey = Uint8Array.from(JSON.parse(secretKeyString));
  const owner = Keypair.fromSecretKey(secretKey);
  return owner;
};

const poolDeposit: (keypair: Keypair, pool: OrcaPool, tokenAAmount: Decimal | OrcaU64, tokenBAmount: Decimal | OrcaU64) => Promise<void> = async function (
  keypair,
  pool,
  tokenAAmount,
  tokenBAmount,
) {

  const slippage = new Decimal(0.01); // FIXME
  const { maxTokenAIn, maxTokenBIn, minPoolTokenAmountOut } = await pool.getDepositQuote(
    tokenAAmount,
    tokenBAmount,
    slippage,
  );

  console.log(`token A ${maxTokenAIn.toNumber()}`);
  console.log(`token B ${maxTokenBIn.toNumber()}`);
  console.log(`LP tokens ${minPoolTokenAmountOut.toNumber()}`);

  const poolDepositPayload = await pool.deposit(
    keypair,
    maxTokenAIn,
    maxTokenBIn,
    minPoolTokenAmountOut,
  );

  const poolDepositTxId = await poolDepositPayload.execute();
  console.log(`Pool deposited ${poolDepositTxId} \n`);
};

const swap: (keypair: Keypair, pool: OrcaPool, tokenFrom: OrcaPoolToken, tokenFromAmount: Decimal, tokenToAmount: Decimal) => Promise<void> = async function (
  keypair,
  pool,
  tokenFrom,
  tokenFromAmount,
  tokenToAmount,

) {
  const swapPayload = await pool.swap(keypair, tokenFrom, tokenFromAmount, tokenToAmount);
  const swapTxId = await swapPayload.execute();
  console.log(`Swapped: ${swapTxId} \n`);
};

const farmDeposit: (connection: Orca, farmId: OrcaFarmConfig, keypair: Keypair, pool: OrcaPool) => Promise<void> = async function(
  connection,
  farmId,
  keypair,
  pool,
) {
  // Note 1: for double dip, repeat step 5 but with the double dip farm
  // Note 2: to harvest reward, orcaSolFarm.harvest(owner)
  // Note 3: to get harvestable reward amount, orcaSolFarm.getHarvestableAmount(owner.publicKey)

  const lpBalance = await pool.getLPBalance(keypair.publicKey);

  const farm = connection.getFarm(farmId);

  const farmDepositPayload = await farm.deposit(keypair, lpBalance);

  const farmDepositTxId = await farmDepositPayload.execute();

  console.log(`Farm deposited ${farmDepositTxId} "\n`);
};

const farmWithDraw: (connection: Orca, farmId: OrcaFarmConfig, keypair: Keypair) => Promise<void> = async function (
  connection,
  farmId,
  keypair,
) {
  const farm = connection.getFarm(farmId);
  const farmBalance = await farm.getFarmBalance(keypair.publicKey); // withdraw the entire balance
  const farmWithdrawPayload = await farm.withdraw(keypair, farmBalance);
  const farmWithdrawTxId = await farmWithdrawPayload.execute();
  console.log(`Farm withdrawn ${farmWithdrawTxId} \n`);
};

const poolWithdraw: (pool: OrcaPool, keypair: Keypair) => Promise<void> = async function (
  pool,
  keypair,
) {
  const withdrawTokenAmount = await pool.getLPBalance(keypair.publicKey);
  const withdrawTokenMint = pool.getPoolTokenMint();
  const { maxPoolTokenAmountIn, minTokenAOut, minTokenBOut } = await pool.getWithdrawQuote(
    withdrawTokenAmount,
    withdrawTokenMint
  );

  console.log(
    `Withdraw at most ${maxPoolTokenAmountIn.toNumber()} ORCA_SOL LP token for at least ${minTokenAOut.toNumber()} ORCA and ${minTokenBOut.toNumber()} SOL`
  );

  const poolWithdrawPayload = await pool.withdraw(
    keypair,
    maxPoolTokenAmountIn,
    minTokenAOut,
    minTokenBOut
  );

  const poolWithdrawTxId = await poolWithdrawPayload.execute();
  console.log(`Pool withdrawn poolWithdrawTxId \n`);
};

const main = async () => {
  const connection = new Connection(
    "https://api.mainnet-beta.solana.com",
    "singleGossip",
  );

  const orca = getOrca(connection);

  // ACCOUNT
  // const keypair = await loadKeypair();
  // console.log(keypair);

  try {
    const farmTokens = getFarmTokens();
    console.log(farmTokens);

    const poolTokens = getPoolTokens();
    console.log(poolTokens);

  } catch (err) {
    console.warn(err);
  }
};

main()
  .then(() => {
    console.log("Done");
  })
  .catch((e) => {
    console.error(e);
  });
