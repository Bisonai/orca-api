# orca-api

```shell
ts-node .
```

## Swap

Swap 0.1 `SOL` for `ETH`.

```
const tokenB = "ETH";
const tokenA = "SOL";
const poolName = getPoolName(tokenA, tokenB);

if (poolName) {
  const poolAddress = getPoolAddress(poolName);
  console.log(`address ${poolAddress}`);
  const pool = orca.getPool(poolAddress);

  const tokenFrom = getTokenFromPool(pool, tokenA);
  const tokenFromAmount = new Decimal(0.1);
  const swapQuote = await getSwapQuote(
    pool,
    tokenFrom,
    tokenFromAmount,
  );

  printSwapQuote(swapQuote);

  const swapTxPayload = await swap(
    pool,
    keypair,
    swapQuote,
  );

  console.log(swapTxPayload);

  const swapTxId = await swapTxPayload.execute();
  console.log(`Swapped ${swapTxId} \n`);
}
```

## Portfolio

Show portfolio.

```typescript
const portfolio = await getPortfolio(connection, keypair);
console.log(portfolio);
```
