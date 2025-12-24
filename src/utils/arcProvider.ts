/**
 * Arc Network Provider Utilities
 * 
 * This module provides read-only blockchain access for Arc Network.
 * For write operations, use the Circle Wallet service via backend API.
 * 
 * IMPORTANT: This provider is READ-ONLY. It cannot sign transactions.
 * All signing must go through Circle Programmable Wallets via the backend.
 */

// Arc Testnet Configuration
export const ARC_TESTNET_CONFIG = {
  chainId: 5042002,
  chainIdHex: '0x4cef52',
  name: 'Arc Testnet',
  rpcUrl: 'https://rpc.testnet.arc.network',
  blockExplorer: 'https://testnet.arcscan.app',
  // Note: Arc uses USDC as native gas currency
  nativeCurrency: {
    name: 'USDC',
    symbol: 'USDC',
    decimals: 6, // USDC has 6 decimals, NOT 18!
  },
};

// USDC Contract Address on Arc Testnet
export const USDC_CONTRACT_ADDRESS = '0x3600000000000000000000000000000000000000';

/**
 * Creates a read-only provider for Arc Network
 * 
 * Use this for:
 * - Reading contract state
 * - Getting balances
 * - Querying events
 * - Estimating gas
 * 
 * DO NOT use for:
 * - Signing transactions (use Circle backend)
 * - Sending transactions (use Circle backend)
 */
export async function getArcProvider() {
  // Dynamic import to avoid loading ethers unless needed
  const { ethers } = await import('ethers');
  
  const provider = new ethers.JsonRpcProvider(
    ARC_TESTNET_CONFIG.rpcUrl,
    {
      chainId: ARC_TESTNET_CONFIG.chainId,
      name: ARC_TESTNET_CONFIG.name,
    }
  );
  
  return provider;
}

/**
 * Verifies connection to Arc Network
 * Returns network info if connected, throws if not
 */
export async function verifyArcConnection() {
  const provider = await getArcProvider();
  const network = await provider.getNetwork();
  
  if (Number(network.chainId) !== ARC_TESTNET_CONFIG.chainId) {
    throw new Error(
      `Wrong network. Expected chainId ${ARC_TESTNET_CONFIG.chainId}, got ${network.chainId}`
    );
  }
  
  return {
    chainId: Number(network.chainId),
    name: network.name,
    connected: true,
  };
}

/**
 * Gets the balance of an address on Arc Network
 * Returns balance in USDC (formatted with 6 decimals)
 */
export async function getBalance(address: string): Promise<string> {
  const { ethers } = await import('ethers');
  const provider = await getArcProvider();
  const balance = await provider.getBalance(address);
  
  // Format with 6 decimals (USDC)
  return ethers.formatUnits(balance, 6);
}

/**
 * Creates a read-only contract instance
 * 
 * Use for:
 * - Calling view/pure functions
 * - Reading state variables
 * - Querying events
 * 
 * For write operations, use executeContractCall via Circle backend
 */
export async function getReadOnlyContract(
  contractAddress: string,
  abi: string | string[]
) {
  const { ethers } = await import('ethers');
  const provider = await getArcProvider();
  
  return new ethers.Contract(contractAddress, abi, provider);
}

/**
 * Utility to convert USDC amount to smallest unit
 * USDC has 6 decimals
 * 
 * Example: parseUSDC("1.5") returns 1500000n
 */
export async function parseUSDC(amount: string): Promise<bigint> {
  const { ethers } = await import('ethers');
  return ethers.parseUnits(amount, 6);
}

/**
 * Utility to format USDC from smallest unit
 * 
 * Example: formatUSDC(1500000n) returns "1.5"
 */
export async function formatUSDC(amount: bigint): Promise<string> {
  const { ethers } = await import('ethers');
  return ethers.formatUnits(amount, 6);
}

/**
 * Encodes a function call for use with Circle backend
 * 
 * This prepares the calldata that Circle will use to execute
 * the transaction on behalf of the user's Programmable Wallet
 */
export async function encodeFunctionCall(
  abi: string[],
  functionName: string,
  args: unknown[]
): Promise<string> {
  const { ethers } = await import('ethers');
  const iface = new ethers.Interface(abi);
  return iface.encodeFunctionData(functionName, args);
}

/**
 * Estimates gas for a contract call
 * 
 * Note: On Arc Network, gas is paid in USDC
 * The returned value is in gas units, not USDC
 */
export async function estimateGas(
  contractAddress: string,
  abi: string[],
  functionName: string,
  args: unknown[],
  from?: string,
  value?: bigint
): Promise<bigint> {
  const { ethers } = await import('ethers');
  const provider = await getArcProvider();
  const iface = new ethers.Interface(abi);
  const data = iface.encodeFunctionData(functionName, args);
  
  const tx: {
    to: string;
    data: string;
    from?: string;
    value?: bigint;
  } = {
    to: contractAddress,
    data,
  };
  
  if (from) tx.from = from;
  if (value) tx.value = value;
  
  return await provider.estimateGas(tx);
}
