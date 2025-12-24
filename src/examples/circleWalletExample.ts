/**
 * Circle Programmable Wallet - Complete Example
 * 
 * This file demonstrates the correct architecture for using
 * Circle Programmable Wallets with EVM-compatible smart contracts.
 * 
 * KEY CONCEPTS:
 * 1. READ operations use standard ethers.js provider (no signing needed)
 * 2. WRITE operations go through Circle backend (server-side signing)
 * 3. NO window.ethereum or MetaMask dependency
 * 4. Private keys never touch the frontend
 */

import { getArcProvider, getReadOnlyContract, parseUSDC, ARC_TESTNET_CONFIG } from '@/utils/arcProvider';
import { circleWallet, CircleWallet } from '@/utils/circleWalletClient';

// Example NFT Contract ABI (subset)
const NFT_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function balanceOf(address owner) view returns (uint256)',
  'function ownerOf(uint256 tokenId) view returns (address)',
  'function tokenURI(uint256 tokenId) view returns (string)',
  'function mint(address to) external',
  'function safeMint(address to) external',
  'function mintWithPayment(address to) external payable',
];

/**
 * ============================================
 * PART 1: WALLET CONNECTION (Circle Style)
 * ============================================
 * 
 * Unlike MetaMask, Circle wallets don't use window.ethereum.
 * Instead, we create/retrieve wallets via the backend API.
 */

/**
 * connectWallet - Circle Programmable Wallet Version
 * 
 * DIFFERENCES FROM METAMASK:
 * - No window.ethereum check
 * - No eth_requestAccounts
 * - Wallet is created/managed server-side
 * - Returns wallet info including ID (needed for signing)
 */
export async function connectWallet(): Promise<{
  address: string;
  walletId: string;
  isConnected: boolean;
}> {
  try {
    // Option 1: Create a new wallet
    const { wallet } = await circleWallet.createWallet();
    
    return {
      address: wallet.address,
      walletId: wallet.id,
      isConnected: true,
    };
    
    // Option 2: If you have stored walletSetId, retrieve existing wallets
    // const wallets = await circleWallet.getWallets(storedWalletSetId);
    // return wallets[0]; // Return first wallet
  } catch (error) {
    console.error('Failed to connect wallet:', error);
    throw error;
  }
}

/**
 * ============================================
 * PART 2: READ OPERATIONS (Standard EVM)
 * ============================================
 * 
 * Reading blockchain data works the same way as with any EVM.
 * We use a standard JSON-RPC provider - no wallet needed.
 */

/**
 * getArcProvider - Already defined in arcProvider.ts
 * 
 * Returns a read-only ethers.js provider connected to Arc Network.
 * Use for all READ operations.
 */

/**
 * Read contract data - No wallet needed
 */
export async function readContractData(contractAddress: string) {
  // Get read-only contract instance
  const contract = await getReadOnlyContract(contractAddress, NFT_ABI);
  
  // Call view functions (no gas, no signing)
  const name = await contract.name();
  const symbol = await contract.symbol();
  
  return { name, symbol };
}

/**
 * Check NFT balance of an address
 */
export async function getNFTBalance(
  contractAddress: string,
  ownerAddress: string
): Promise<number> {
  const contract = await getReadOnlyContract(contractAddress, NFT_ABI);
  const balance = await contract.balanceOf(ownerAddress);
  return Number(balance);
}

/**
 * Get token URI for metadata
 */
export async function getTokenURI(
  contractAddress: string,
  tokenId: number
): Promise<string> {
  const contract = await getReadOnlyContract(contractAddress, NFT_ABI);
  return await contract.tokenURI(tokenId);
}

/**
 * ============================================
 * PART 3: WRITE OPERATIONS (Circle Signing)
 * ============================================
 * 
 * This is where Circle differs from MetaMask.
 * Instead of signing in the browser, we send the transaction
 * details to our backend, which uses Circle SDK to sign.
 */

/**
 * signTransactionWithCircle - Core signing function
 * 
 * HOW IT WORKS:
 * 1. Frontend prepares transaction parameters (no private key!)
 * 2. Parameters sent to Edge Function
 * 3. Edge Function calls Circle API
 * 4. Circle signs with the wallet's private key (stored in Circle's HSM)
 * 5. Circle broadcasts transaction to blockchain
 * 6. Transaction hash returned to frontend
 * 
 * SECURITY:
 * - Private key NEVER leaves Circle's infrastructure
 * - Entity Secret validates the request (stored in backend env)
 * - Frontend only knows wallet ID, not private key
 */
export async function signTransactionWithCircle(params: {
  walletId: string;
  contractAddress: string;
  functionName: string;
  args: unknown[];
  value?: string; // USDC amount (remember: 6 decimals!)
}) {
  const { walletId, contractAddress, functionName, args, value } = params;
  
  console.log('Preparing transaction for Circle signing...');
  console.log('Contract:', contractAddress);
  console.log('Function:', functionName);
  console.log('Args:', args);
  if (value) {
    console.log('Value:', value, 'USDC');
  }
  
  // Execute via Circle backend
  const result = await circleWallet.executeContractCall({
    walletId,
    contractAddress,
    abi: NFT_ABI,
    functionName,
    args,
    value,
  });
  
  console.log('Transaction submitted via Circle');
  console.log('Transaction ID:', result.id);
  console.log('Status:', result.state);
  
  if (result.txHash) {
    console.log('TX Hash:', result.txHash);
    console.log(
      'View on explorer:',
      `${ARC_TESTNET_CONFIG.blockExplorer}/tx/${result.txHash}`
    );
  }
  
  return result;
}

/**
 * ============================================
 * PART 4: COMPLETE FLOW EXAMPLES
 * ============================================
 */

/**
 * Example: Free Mint Flow
 */
export async function freeMintExample(
  walletId: string,
  walletAddress: string,
  contractAddress: string
) {
  console.log('=== FREE MINT FLOW ===');
  
  // Step 1: Check current balance (READ - no signing)
  const beforeBalance = await getNFTBalance(contractAddress, walletAddress);
  console.log('NFTs owned before:', beforeBalance);
  
  // Step 2: Mint NFT (WRITE - Circle signing)
  const tx = await signTransactionWithCircle({
    walletId,
    contractAddress,
    functionName: 'mint',
    args: [walletAddress],
  });
  
  // Step 3: Wait a bit and check new balance
  console.log('Waiting for confirmation...');
  
  // Step 4: Verify (READ - no signing)
  const afterBalance = await getNFTBalance(contractAddress, walletAddress);
  console.log('NFTs owned after:', afterBalance);
  
  return tx;
}

/**
 * Example: Paid Mint Flow (with USDC)
 * 
 * IMPORTANT: On Arc Network, gas is USDC with 6 decimals
 * Example: "1.5" USDC = 1500000 smallest units
 */
export async function paidMintExample(
  walletId: string,
  walletAddress: string,
  contractAddress: string,
  priceInUSDC: string // e.g., "10" for 10 USDC
) {
  console.log('=== PAID MINT FLOW ===');
  console.log('Price:', priceInUSDC, 'USDC');
  
  // Step 1: Approve USDC spending (if using transferFrom pattern)
  // This is needed if the contract pulls USDC from the user
  console.log('Approving USDC spending...');
  await circleWallet.approveUSDC({
    walletId,
    spenderAddress: contractAddress,
    amount: priceInUSDC,
  });
  
  // Step 2: Call the paid mint function
  // The value field sends USDC (native currency on Arc)
  const tx = await signTransactionWithCircle({
    walletId,
    contractAddress,
    functionName: 'mintWithPayment',
    args: [walletAddress],
    value: priceInUSDC, // This sends USDC as the transaction value
  });
  
  return tx;
}

/**
 * Example: Batch Mint Flow
 */
export async function batchMintExample(
  walletId: string,
  walletAddress: string,
  contractAddress: string,
  quantity: number
) {
  console.log('=== BATCH MINT FLOW ===');
  console.log('Quantity:', quantity);
  
  // If contract has batchMint function:
  // const tx = await signTransactionWithCircle({
  //   walletId,
  //   contractAddress,
  //   functionName: 'batchMint',
  //   args: [walletAddress, quantity],
  // });
  
  // If not, mint one by one:
  const results = [];
  for (let i = 0; i < quantity; i++) {
    console.log(`Minting ${i + 1}/${quantity}...`);
    const tx = await signTransactionWithCircle({
      walletId,
      contractAddress,
      functionName: 'mint',
      args: [walletAddress],
    });
    results.push(tx);
  }
  
  return results;
}

/**
 * ============================================
 * COMPARISON: MetaMask vs Circle
 * ============================================
 */

// ❌ METAMASK WAY (DO NOT USE WITH CIRCLE)
/*
async function metamaskMint(contractAddress: string) {
  // Check for injected provider
  if (!window.ethereum) {
    throw new Error('MetaMask not installed');
  }
  
  // Request account access
  const accounts = await window.ethereum.request({
    method: 'eth_requestAccounts'
  });
  
  // Create provider and signer
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  
  // Create contract with signer (CAN WRITE)
  const contract = new ethers.Contract(contractAddress, NFT_ABI, signer);
  
  // Sign and send transaction IN BROWSER
  const tx = await contract.mint(accounts[0]);
  await tx.wait();
}
*/

// ✅ CIRCLE WAY (USE THIS)
/*
async function circleMint(
  walletId: string,
  walletAddress: string,
  contractAddress: string
) {
  // No window.ethereum needed
  // No browser signing
  // Transaction signed server-side by Circle
  
  const tx = await circleWallet.executeContractCall({
    walletId,
    contractAddress,
    abi: NFT_ABI,
    functionName: 'mint',
    args: [walletAddress],
  });
  
  return tx;
}
*/
