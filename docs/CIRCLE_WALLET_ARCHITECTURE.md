# Circle Programmable Wallet Architecture

## Conceptual Overview: EVM Standard vs Circle Programmable Wallet

### Traditional EVM Flow (MetaMask)
```
┌─────────────┐     ┌──────────────────┐     ┌─────────────┐
│   Browser   │────▶│  window.ethereum │────▶│  MetaMask   │
│    dApp     │     │    (injected)    │     │  Extension  │
└─────────────┘     └──────────────────┘     └─────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │   User Signs     │
                    │   Locally        │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │   Broadcast to   │
                    │   Blockchain     │
                    └──────────────────┘
```

### Circle Programmable Wallet Flow
```
┌─────────────┐     ┌──────────────────┐     ┌─────────────┐
│   Browser   │────▶│  Backend API     │────▶│  Circle     │
│    dApp     │     │  (Edge Function) │     │  SDK/API    │
└─────────────┘     └──────────────────┘     └─────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Circle Signs    │
                    │  Server-Side     │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Circle Submits  │
                    │  to Blockchain   │
                    └──────────────────┘
```

## Key Differences

| Aspect | MetaMask (Traditional) | Circle Programmable Wallet |
|--------|------------------------|---------------------------|
| Provider | `window.ethereum` | EVM RPC (read-only) |
| Signer | Browser extension | Circle API (server-side) |
| Key Storage | User's device | Circle's secure infrastructure |
| Transaction Signing | User approves in popup | API call with Entity Secret |
| Gas Payment | Native token (ETH) | USDC on Arc Network |

## Step-by-Step Flow

### 1. Reading Blockchain Data (Same for Both)
```
Frontend ──▶ ethers.JsonRpcProvider ──▶ Arc RPC ──▶ Blockchain
```
- Uses standard EVM JSON-RPC
- No wallet needed for read operations
- Works with any EVM-compatible RPC

### 2. Writing to Blockchain (Circle Flow)
```
Step 1: Frontend prepares transaction data
        ↓
Step 2: Frontend calls Backend API
        ↓
Step 3: Backend validates request
        ↓
Step 4: Backend calls Circle SDK
        ↓
Step 5: Circle signs transaction with wallet's private key
        ↓
Step 6: Circle broadcasts to blockchain
        ↓
Step 7: Backend returns tx hash to Frontend
```

## Arc Network Specifics

### Network Configuration
```typescript
const ARC_TESTNET = {
  chainId: 5042002,
  chainIdHex: '0x4cef52',
  name: 'Arc Testnet',
  rpcUrl: 'https://rpc.testnet.arc.network',
  blockExplorer: 'https://testnet.arcscan.app',
  nativeCurrency: {
    name: 'USDC',
    symbol: 'USDC',
    decimals: 6  // IMPORTANT: USDC has 6 decimals, not 18!
  }
};

// USDC Contract on Arc Testnet
const USDC_ADDRESS = '0x3600000000000000000000000000000000000000';
```

### Gas Payment with USDC
On Arc Network, gas is paid in USDC (6 decimals). This means:
- `1 USDC = 1_000_000` (1e6 units)
- Gas price is denominated in USDC units
- Transaction `value` field still works but represents USDC

## Architecture Components

### 1. Read-Only Provider (Frontend)
```typescript
// This provider can READ blockchain data
// NO SIGNING CAPABILITY - purely for queries
const provider = new ethers.JsonRpcProvider(ARC_TESTNET.rpcUrl);

// Read operations work normally:
await provider.getBalance(address);
await provider.getBlockNumber();
await contract.balanceOf(address); // Read-only contract calls
```

### 2. Circle Wallet Manager (Backend)
```typescript
// The backend handles ALL write operations
// Frontend NEVER has access to private keys
// Signing happens via Circle's secure infrastructure
```

### 3. Transaction Flow
```
┌────────────────────────────────────────────────────────────────┐
│                        FRONTEND                                 │
├────────────────────────────────────────────────────────────────┤
│  1. User initiates action (e.g., "Mint NFT")                   │
│  2. Frontend prepares transaction parameters:                   │
│     - contractAddress                                          │
│     - functionName                                             │
│     - arguments                                                │
│     - value (if payable)                                       │
│  3. Frontend calls backend API                                 │
└────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────────┐
│                        BACKEND                                  │
├────────────────────────────────────────────────────────────────┤
│  4. Validate request (auth, permissions)                       │
│  5. Get user's Circle wallet ID                                │
│  6. Build transaction via Circle SDK:                          │
│     - Encode function call                                     │
│     - Set gas parameters                                       │
│     - Set value (USDC amount)                                  │
│  7. Execute via Circle API                                     │
│  8. Return transaction hash                                    │
└────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────────┐
│                     CIRCLE INFRASTRUCTURE                       │
├────────────────────────────────────────────────────────────────┤
│  9. Circle validates Entity Secret                             │
│ 10. Circle retrieves wallet's private key                      │
│ 11. Circle signs transaction                                   │
│ 12. Circle broadcasts to Arc Network                           │
│ 13. Returns transaction result                                 │
└────────────────────────────────────────────────────────────────┘
```

## Important Constraints

### ❌ What NOT to Do
```typescript
// DO NOT assume MetaMask or injected provider
if (window.ethereum) { } // ❌ Wrong approach

// DO NOT request accounts from browser
await window.ethereum.request({ method: 'eth_requestAccounts' }); // ❌

// DO NOT sign in browser
const signer = await provider.getSigner(); // ❌ No signer available
```

### ✅ What TO Do
```typescript
// Use read-only provider for queries
const provider = new ethers.JsonRpcProvider(rpcUrl); // ✅

// Call backend for write operations
await fetch('/api/circle-wallet', {
  method: 'POST',
  body: JSON.stringify({
    action: 'executeContractCall',
    walletId: userWalletId,
    contractAddress: '0x...',
    functionName: 'mint',
    args: [tokenId]
  })
}); // ✅
```

## Security Model

### Frontend Security
- ✅ Can read any public blockchain data
- ✅ Can display wallet balances and NFTs
- ❌ Cannot sign transactions
- ❌ Has no access to private keys

### Backend Security
- ✅ Validates user authentication before operations
- ✅ Uses Entity Secret (never exposed to frontend)
- ✅ Controls which operations are allowed
- ✅ Can implement rate limiting, spending limits

### Circle Security
- ✅ Private keys never leave Circle infrastructure
- ✅ Hardware security modules (HSM) protect keys
- ✅ Audit logging of all operations
