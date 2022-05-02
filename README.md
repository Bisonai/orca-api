# Orca API

Orca API is a REST API server that defines a user-friendly interface to [Orca SDK](https://github.com/orca-so/typescript-sdk).
The Orca SDK contains a set of simple-to-use APIs to allow developers to integrate with Orca's decentralized exchange platform.

## Installation

```bash
npm install
```

## Running the app

```bash
# development
npm run start

# watch mode
npm run start:dev

# production mode
npm run start:prod
```

When running locally, Orca API is accessible at http://0.0.0.0:3000.

## Test

```bash
# unit tests
npm run test

# e2e tests
npm run test:e2e

# test coverage
npm run test:cov
```

## Endpoints

All endpoints with detailed parameters and responses can be found at http://0.0.0.0:3000/docs/.

## Pools

### `/pool`

List all Orca pools.

### `/pool/balance`

Gauge funds allocated in designated pool.

### `/pool/deposit`

Deposit funds to designated pool.

### `/pool/withdraw`

Withdraw funds from designated pool.

## Farms

### `/farm`

List all Orca farms.

### `/farm/balance`

Gauge funds allocated in designated farm.

### `/farm/deposit`

Deposit funds to designated farm.

### `/farm/withdraw`

Withdraw funds from designated farm.

### Swap

### `/swap`

Swap tokens.

### Others

### `/portfolio`

List account's portfolio.

### `/token`

List all tokens traded at Orca.

## License

Apache License 2.0
