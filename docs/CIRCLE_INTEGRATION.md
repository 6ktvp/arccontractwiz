# Circle Programmable Wallet Integration

This document explains how the Smart Contract Wizard integrates with Circle's ecosystem while maintaining a completely **off-chain, non-invasive** approach.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    Smart Contract Wizard                        │
│                    (Frontend - Unchanged)                       │
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐        │
│  │   Select    │ -> │  Configure  │ -> │  Generate   │        │
│  │   Type      │    │   Options   │    │   Code      │        │
│  └─────────────┘    └─────────────┘    └─────────────┘        │
│                                              │                  │
│                                              v                  │
│                                    ┌─────────────────┐         │
│                                    │ Export to Remix │         │
│                                    │ (User deploys)  │         │
│                                    └─────────────────┘         │
└─────────────────────────────────────────────────────────────────┘

                              │
                              │ (After user deploys contract)
                              v

┌─────────────────────────────────────────────────────────────────┐
│               Circle Backend (Edge Functions)                    │
│                    (Off-chain, Optional)                        │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                   circle-wallet                          │   │
│  │                                                          │   │
│  │  • createProgrammableWallet()                           │   │
│  │  • approveUSDC()                                        │   │
│  │  • executeContractCall()                                │   │
│  │  • getWalletBalance()                                   │   │
│  │  • getWallets()                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                  │
│                              v                                  │
│                 ┌─────────────────────────┐                    │
│                 │  Circle Programmable    │                    │
│                 │  Wallet SDK             │                    │
│                 └─────────────────────────┘                    │
│                              │                                  │
│                              v                                  │
│                 ┌─────────────────────────┐                    │
│                 │  Blockchain             │                    │
│                 │  (User's deployed       │                    │
│                 │   contract)             │                    │
│                 └─────────────────────────┘                    │
└─────────────────────────────────────────────────────────────────┘
```

## Key Principles

### ✅ What This Integration Does

1. **USDC-Compatible**: Generated contracts include USDC constant for Arc Testnet
2. **Circle-Ready**: Contracts follow patterns expected by Circle's infrastructure
3. **Programmable Wallet Friendly**: Functions accept `address` parameters, making them wallet-agnostic

### ❌ What This Integration Does NOT Do

- No Circle SDK in the frontend
- No wallet connection in the dApp
- No on-chain deployment from the dApp
- No runtime API calls to Circle
- No changes to the existing wizard UI

## Backend API Reference

### Edge Function: `circle-wallet`

Base URL: `https://fetwpmqetvgvdkvesalc.supabase.co/functions/v1/circle-wallet`

#### Create Programmable Wallet

```javascript
const response = await fetch(baseUrl, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'createWallet',
    userId: 'optional-user-id'
  })
});

// Response
{
  "success": true,
  "wallet": { /* wallet details */ },
  "walletSetId": "...",
  "message": "Programmable wallet created successfully."
}
```

#### Approve USDC Spending

```javascript
const response = await fetch(baseUrl, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'approveUSDC',
    walletId: 'wallet-id',
    spender: '0xContractAddress',
    amount: '1000000' // 1 USDC (6 decimals)
  })
});

// Response
{
  "success": true,
  "transaction": { /* tx details */ },
  "message": "USDC approval submitted successfully."
}
```

#### Execute Contract Call

```javascript
const response = await fetch(baseUrl, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'executeContractCall',
    walletId: 'wallet-id',
    contractAddress: '0xDeployedContract',
    functionName: 'mint',
    args: ['0xRecipientAddress', 1]
  })
});

// Response
{
  "success": true,
  "transaction": { /* tx details */ },
  "message": "Contract call mint executed successfully."
}
```

#### Get Wallet Balance

```javascript
const response = await fetch(baseUrl, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'getWalletBalance',
    walletId: 'wallet-id'
  })
});

// Response
{
  "success": true,
  "balances": [ /* token balances */ ],
  "message": "Wallet balance retrieved successfully."
}
```

## Environment Variables

Required secrets (configured via environment variables):

| Variable | Description |
|----------|-------------|
| `CIRCLE_API_KEY` | Your Circle API key |
| `CIRCLE_ENTITY_SECRET` | Your Circle entity secret for wallet operations |

## Generated Contract Features

All generated contracts (ERC-721 and ERC-1155) automatically include:

### 1. Circle-Compatible Header

```solidity
/**
 * @title Circle-Compatible Smart Contract
 * @notice Generated to be compatible with Circle USDC and Programmable Wallets
 * @dev No wallet connection, no deployment, no runtime SDK usage
 * @custom:network Arc Testnet (Chain ID: 5042002)
 */
```

### 2. USDC Constant

```solidity
IERC20 public constant USDC = IERC20(0x3600000000000000000000000000000000000000);
```

### 3. Wallet-Agnostic Functions

Functions that accept `address` parameters instead of assuming `msg.sender`:

```solidity
function mint(address to, uint256 amount) external {
    require(USDC.transferFrom(msg.sender, address(this), fee));
    _mint(to, amount);
}
```

## Workflow

1. **User creates contract** in the Smart Contract Wizard (unchanged)
2. **User exports to Remix** and deploys manually
3. **After deployment**, user can optionally use Circle Programmable Wallets via the backend API
4. **Backend handles** wallet creation, USDC approvals, and contract interactions

## Security Considerations

- API keys are stored securely in environment variables
- Never exposed to the frontend
- All Circle operations happen server-side
- Contract code is auditable and transparent

## Terminology

Always use these terms consistently:

- ✅ "USDC-compatible"
- ✅ "Circle-ready"
- ✅ "Programmable Wallet friendly"

Never claim:

- ❌ On-chain Circle SDK usage
- ❌ Native Circle smart contracts
- ❌ Circle API inside Solidity
