import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { readFile, writeFile } from "mz/fs";
import { ParsedAccountData, Connection, Keypair } from "@solana/web3.js";
import {  Network, Orca, OrcaU64, OrcaPool, OrcaPoolToken, getOrca, OrcaFarmConfig, OrcaPoolConfig } from "@orca-so/sdk";
import Decimal from "decimal.js";
import { argv } from 'process';
import { createRepl, create } from "ts-node";
import { TokenListProvider } from '@solana/spl-token-registry';
// import { process } from 'process';

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

interface TokenQuote {
  token: OrcaPoolToken;
  amount: Decimal | OrcaU64;
}

interface SwapQuote {
  from: TokenQuote;
  to: TokenQuote;
}

interface SPLPortfolio {
  mintAddress: string;
  amount: string;
  decimals: number;
}

interface Portfolio {
  balance: number;
  splToken: SPLPortfolio[];
}

async function getAllTokens(network: Network) {
  return await new TokenListProvider().resolve().then((tokens) => {
    return tokens.filterByClusterSlug(network).getList();
  });
}

function getTokenFromPool(
  pool: OrcaPool,
  token: string,
): OrcaPoolToken {
  const tokenA = pool.getTokenA();
  const tokenB = pool.getTokenB();

  const tokenATag = tokenA.tag;
  const tokenBTag = tokenB.tag;

  if (token == tokenATag)
    return tokenA;
  else if (token == tokenBTag)
    return tokenB;
  else
    throw new Error(`Token ${token} is not part of pool ${pool}.`);
}

function assert(
  condition: unknown,
  message: string = "",
): asserts condition {
  if (!condition) throw new Error(message);
}

async function swap(
  pool: OrcaPool,
  keypair: Keypair,
  swapQuote: SwapQuote,
) {
  const swapTx = await pool.swap(
    keypair,
    swapQuote.from.token,
    swapQuote.from.amount,
    swapQuote.to.amount,
  );

  console.log(swapTx);

  return swapTx;
}

async function getPortfolio(
  connection: Connection,
  keypair: Keypair,
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
            bytes: keypair.publicKey.toBase58(),
          },
        },
      ],
    }
  );

  const balance = await getBalance(connection, keypair);

  let splToken: SPLPortfolio[] = [];

  for (let acc of accounts) {
    const account: any = acc.account.data;  // FIXME any
    const mintAddress = account.parsed.info.mint;
    const amount = account.parsed.info.tokenAmount.amount;
    const decimals = account.parsed.info.tokenAmount.decimals;

    splToken.push({
      mintAddress,
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

function toSol(amount: number, decimals: number): number {
  return amount * (10**(-decimals));
}

async function getBalance(
  connection: Connection,
  keypair: Keypair,
): Promise<number> {
  return await connection.getBalance(keypair.publicKey);
}

function poolFromTokens(
  tokenA: string,
  tokenB: string,
): string {
  return `${tokenA}_${tokenB}`;
}

function poolNameExist(pool_name: string): boolean {
  const keys = Object.keys(OrcaPoolConfig);
  if (keys.find(x => x == pool_name) == undefined)
    return false;
  else
    return true;
}

function getPoolName(
  tokenA: string,
  tokenB: string,
): string | undefined {
  const poolAB = poolFromTokens(tokenA, tokenB);
  const poolBA = poolFromTokens(tokenB, tokenA);

  if (poolNameExist(poolAB))
    return poolAB;
  else if (poolNameExist(poolBA))
    return poolBA;
  else
    return undefined;
}

function getPoolAddress(
  pool_name: string,
): OrcaPoolConfig {
  /// call `poolNameExist` before
  return OrcaPoolConfig[pool_name as keyof typeof OrcaPoolConfig];
}

function getPools(): string[] {
  return Object.keys(OrcaPoolConfig);
}

function getPoolTokens(): string[] {
  const pools = getPools();
  const tokens = new Set(pools.flatMap(p => p.split("_")));
  return Array.from(tokens.values());
}

function getFarms(): string[] {
  return Object.keys(OrcaFarmConfig);
}

function getFarmTokens(): string[] {
  const farms = getFarms();
  const tokens = new Set(farms.flatMap(p => p.split("_").slice(0, 2)));
  // FIXME keep information about aqua farms and double dips
  return Array.from(tokens.values());
}

function generateKeypair(): Keypair {
  return Keypair.generate();
}

async function saveKeypair(
  keypair: Keypair,
  keypairPath: "secret-key.json",
) {
  const secretKey = "[" + keypair.secretKey.toString() + "]";
  await writeFile(keypairPath, secretKey, {
    encoding: "utf8",
  });
}

async function loadKeypair(
  secretkeyPath: string = "secret-key.json",
): Promise<Keypair> {
  const secretKeyString = await readFile(secretkeyPath, {
    encoding: "utf8",
  });
  const secretKey = Uint8Array.from(JSON.parse(secretKeyString));
  const owner = Keypair.fromSecretKey(secretKey);
  return owner;
}

async function poolDeposit(
  keypair: Keypair,
  pool: OrcaPool,
  tokenAAmount: Decimal | OrcaU64,
  tokenBAmount: Decimal | OrcaU64,
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
}

async function getSwapQuote(
  pool: OrcaPool,
  tokenFrom: OrcaPoolToken,
  tokenFromAmount: Decimal | OrcaU64,
): Promise<SwapQuote> {
  let tokenTo;

  const tokenA = pool.getTokenA();
  const tokenB = pool.getTokenB();

  if (tokenA == tokenFrom)
    tokenTo = tokenB;
  else
    tokenTo = tokenA;

  const quote = await pool.getQuote(
    tokenFrom,
    tokenFromAmount,
  );

  const tokenToAmount = quote.getMinOutputAmount();

  const swapQuote = {
    "from": {
      "token": tokenFrom,
      "amount": tokenFromAmount,
    },
    "to": {
      "token": tokenTo,
      "amount": tokenToAmount,
    }
  };

  return swapQuote;
}

function printSwapQuote(swapQuote: SwapQuote) {
  console.log(
    `${swapQuote.from.amount.toNumber()}`,
    `${swapQuote.from.token.tag}`,
    ` -> `,
    `${swapQuote.to.amount.toNumber()}`,
    `${swapQuote.to.token.tag}`
  );
}

async function farmDeposit(
  connection: Orca,
  farmId: OrcaFarmConfig,
  keypair: Keypair,
  pool: OrcaPool,
) {
  // Note 1: for double dip, repeat step 5 but with the double dip farm
  // Note 2: to harvest reward, orcaSolFarm.harvest(owner)
  // Note 3: to get harvestable reward amount, orcaSolFarm.getHarvestableAmount(owner.publicKey)

  const lpBalance = await pool.getLPBalance(keypair.publicKey);

  const farm = connection.getFarm(farmId);

  const farmDepositPayload = await farm.deposit(keypair, lpBalance);

  const farmDepositTxId = await farmDepositPayload.execute();

  console.log(`Farm deposited ${farmDepositTxId} "\n`);
}

async function farmWithDraw(
  connection: Orca,
  farmId: OrcaFarmConfig,
  keypair: Keypair,
) {
  const farm = connection.getFarm(farmId);
  const farmBalance = await farm.getFarmBalance(keypair.publicKey); // withdraw the entire balance
  const farmWithdrawPayload = await farm.withdraw(keypair, farmBalance);
  const farmWithdrawTxId = await farmWithdrawPayload.execute();
  console.log(`Farm withdrawn ${farmWithdrawTxId} \n`);
}

async function poolWithdraw(
  pool: OrcaPool,
  keypair: Keypair,
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
}



const main = async () => {
  let rpcEndpoint: string;
  let network: Network;

  const networkName = argv[2];

  if (networkName == "mainnet") {
    rpcEndpoint = "https://api.mainnet-beta.solana.com";
    network = Network.MAINNET;
  }
  else {
    rpcEndpoint = "https://api.devnet.solana.com";
    network = Network.DEVNET;
  }

  console.log(network);

  const connection = new Connection(
    rpcEndpoint,
    "singleGossip",
  );
  const orca = getOrca(connection, network);

  // ACCOUNT
  const keypair = await loadKeypair();
  const publicKey = keypair.publicKey.toBase58();
  console.log(`public key: ${publicKey}`);

  try {
    // want to deposit SOL and ORCA
    // const orcaAmount = new Decimal(0.043564);
    // const solAmount = new Decimal(0.10205313299999996);
    // const { maxTokenAIn, maxTokenBIn, minPoolTokenAmountOut } = await pool.getDepositQuote(
    //   orcaAmount,
    //   solAmount
    // );
    // console.log(
    //   `Deposit at most ${maxTokenBIn.toNumber()} SOL and ${maxTokenAIn.toNumber()} ORCA, for at least ${minPoolTokenAmountOut.toNumber()} LP tokens`
    // );

    const portfolio = await getPortfolio(connection, keypair);
    console.log(portfolio);

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
