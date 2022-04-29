import Decimal from 'decimal.js';

export const CONFIG = {
    SOL_DECIMALS: 18,
    DECIMAL_BASE: 10,
    SWAP_FEE: new Decimal(0.000_015),
    WITHDRAW_FEE: new Decimal(0.000_015),
    POOL_DEPOSIT_FEE: new Decimal(0.000_015),
    SLIPPAGE: new Decimal(0.01),
} as const;
