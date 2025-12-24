import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

/**
 * Circle Programmable Wallet Integration
 * 
 * This edge function provides off-chain integration with Circle's
 * Programmable Wallet SDK for USDC-compatible, Circle-ready smart contracts.
 * 
 * Supported operations:
 * - createWallet: Create a new programmable wallet
 * - approveUSDC: Approve USDC spending for a contract
 * - executeContractCall: Execute a contract function via programmable wallet
 * - getWalletBalance: Get wallet USDC balance
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Circle API configuration
const CIRCLE_API_KEY = Deno.env.get('CIRCLE_API_KEY');
const CIRCLE_ENTITY_SECRET = Deno.env.get('CIRCLE_ENTITY_SECRET');
const CIRCLE_BASE_URL = 'https://api.circle.com/v1/w3s';

// Arc Testnet USDC address
const ARC_USDC_ADDRESS = '0x3600000000000000000000000000000000000000';
const ARC_CHAIN_ID = '5042002';

interface CircleRequest {
  action: 'createWallet' | 'approveUSDC' | 'executeContractCall' | 'getWalletBalance' | 'getWallets';
  walletId?: string;
  contractAddress?: string;
  abi?: object[];
  functionName?: string;
  args?: unknown[];
  amount?: string;
  spender?: string;
  userId?: string;
}

// Helper to make Circle API requests
async function circleApiRequest(
  endpoint: string, 
  method: string = 'GET', 
  body?: object
): Promise<Response> {
  const url = `${CIRCLE_BASE_URL}${endpoint}`;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${CIRCLE_API_KEY}`,
  };

  if (CIRCLE_ENTITY_SECRET) {
    headers['X-Entity-Secret'] = CIRCLE_ENTITY_SECRET;
  }

  console.log(`[Circle API] ${method} ${endpoint}`);
  
  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  return response;
}

// Create a new programmable wallet
async function createProgrammableWallet(userId?: string): Promise<object> {
  console.log('[Circle] Creating programmable wallet...');
  
  // First, create a wallet set if needed
  const walletSetResponse = await circleApiRequest('/developer/walletSets', 'POST', {
    name: `SCW-Wallet-Set-${Date.now()}`,
    entitySecretCiphertext: CIRCLE_ENTITY_SECRET,
  });

  if (!walletSetResponse.ok) {
    const error = await walletSetResponse.text();
    console.error('[Circle] Failed to create wallet set:', error);
    throw new Error(`Failed to create wallet set: ${error}`);
  }

  const walletSetData = await walletSetResponse.json();
  const walletSetId = walletSetData.data?.walletSet?.id;

  console.log('[Circle] Wallet set created:', walletSetId);

  // Create wallet in the wallet set
  const walletResponse = await circleApiRequest('/developer/wallets', 'POST', {
    walletSetId,
    blockchains: ['ETH-SEPOLIA'], // Use testnet
    count: 1,
    entitySecretCiphertext: CIRCLE_ENTITY_SECRET,
    metadata: [
      {
        name: 'userId',
        refId: userId || `user-${Date.now()}`,
      }
    ]
  });

  if (!walletResponse.ok) {
    const error = await walletResponse.text();
    console.error('[Circle] Failed to create wallet:', error);
    throw new Error(`Failed to create wallet: ${error}`);
  }

  const walletData = await walletResponse.json();
  console.log('[Circle] Wallet created successfully');

  return {
    success: true,
    wallet: walletData.data?.wallets?.[0],
    walletSetId,
    message: 'Programmable wallet created successfully. This wallet is Circle-ready and USDC-compatible.',
  };
}

// Approve USDC spending for a contract
async function approveUSDC(
  walletId: string, 
  spender: string, 
  amount: string
): Promise<object> {
  console.log(`[Circle] Approving USDC spending for ${spender}...`);

  // ERC20 approve function ABI encoding
  const approveData = encodeApproveFunction(spender, amount);

  const response = await circleApiRequest('/developer/transactions/contractExecution', 'POST', {
    walletId,
    contractAddress: ARC_USDC_ADDRESS,
    abiFunctionSignature: 'approve(address,uint256)',
    abiParameters: [spender, amount],
    fee: {
      type: 'level',
      config: {
        feeLevel: 'MEDIUM',
      },
    },
    entitySecretCiphertext: CIRCLE_ENTITY_SECRET,
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('[Circle] Failed to approve USDC:', error);
    throw new Error(`Failed to approve USDC: ${error}`);
  }

  const data = await response.json();
  console.log('[Circle] USDC approval transaction submitted');

  return {
    success: true,
    transaction: data.data,
    message: `USDC approval for ${amount} to ${spender} submitted successfully.`,
  };
}

// Execute a contract call via programmable wallet
async function executeContractCall(
  walletId: string,
  contractAddress: string,
  functionName: string,
  args: unknown[] = [],
  abi?: object[]
): Promise<object> {
  console.log(`[Circle] Executing contract call: ${functionName} on ${contractAddress}`);

  // Build the ABI function signature from name and args
  const abiSignature = buildAbiFunctionSignature(functionName, args);

  const response = await circleApiRequest('/developer/transactions/contractExecution', 'POST', {
    walletId,
    contractAddress,
    abiFunctionSignature: abiSignature,
    abiParameters: args,
    fee: {
      type: 'level',
      config: {
        feeLevel: 'MEDIUM',
      },
    },
    entitySecretCiphertext: CIRCLE_ENTITY_SECRET,
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('[Circle] Failed to execute contract call:', error);
    throw new Error(`Failed to execute contract call: ${error}`);
  }

  const data = await response.json();
  console.log('[Circle] Contract call transaction submitted');

  return {
    success: true,
    transaction: data.data,
    message: `Contract call ${functionName} executed successfully.`,
  };
}

// Get wallet balance
async function getWalletBalance(walletId: string): Promise<object> {
  console.log(`[Circle] Getting balance for wallet ${walletId}`);

  const response = await circleApiRequest(`/wallets/${walletId}/balances`, 'GET');

  if (!response.ok) {
    const error = await response.text();
    console.error('[Circle] Failed to get wallet balance:', error);
    throw new Error(`Failed to get wallet balance: ${error}`);
  }

  const data = await response.json();
  
  return {
    success: true,
    balances: data.data?.tokenBalances || [],
    message: 'Wallet balance retrieved successfully.',
  };
}

// Get all wallets
async function getWallets(): Promise<object> {
  console.log('[Circle] Getting all wallets');

  const response = await circleApiRequest('/wallets', 'GET');

  if (!response.ok) {
    const error = await response.text();
    console.error('[Circle] Failed to get wallets:', error);
    throw new Error(`Failed to get wallets: ${error}`);
  }

  const data = await response.json();
  
  return {
    success: true,
    wallets: data.data?.wallets || [],
    message: 'Wallets retrieved successfully.',
  };
}

// Helper to encode approve function call
function encodeApproveFunction(spender: string, amount: string): string {
  // This is a simplified version - in production use ethers.js or similar
  return `approve(${spender},${amount})`;
}

// Helper to build ABI function signature
function buildAbiFunctionSignature(functionName: string, args: unknown[]): string {
  // Map argument types for common cases
  const argTypes = args.map(arg => {
    if (typeof arg === 'string' && arg.startsWith('0x')) return 'address';
    if (typeof arg === 'number' || typeof arg === 'bigint') return 'uint256';
    if (typeof arg === 'string') return 'string';
    if (typeof arg === 'boolean') return 'bool';
    return 'bytes';
  });

  return `${functionName}(${argTypes.join(',')})`;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate API keys are configured
    if (!CIRCLE_API_KEY) {
      throw new Error('CIRCLE_API_KEY is not configured');
    }

    const body: CircleRequest = await req.json();
    const { action } = body;

    console.log(`[Circle Wallet] Processing action: ${action}`);

    let result: object;

    switch (action) {
      case 'createWallet':
        result = await createProgrammableWallet(body.userId);
        break;

      case 'approveUSDC':
        if (!body.walletId || !body.spender || !body.amount) {
          throw new Error('walletId, spender, and amount are required for approveUSDC');
        }
        result = await approveUSDC(body.walletId, body.spender, body.amount);
        break;

      case 'executeContractCall':
        if (!body.walletId || !body.contractAddress || !body.functionName) {
          throw new Error('walletId, contractAddress, and functionName are required for executeContractCall');
        }
        result = await executeContractCall(
          body.walletId,
          body.contractAddress,
          body.functionName,
          body.args || [],
          body.abi
        );
        break;

      case 'getWalletBalance':
        if (!body.walletId) {
          throw new Error('walletId is required for getWalletBalance');
        }
        result = await getWalletBalance(body.walletId);
        break;

      case 'getWallets':
        result = await getWallets();
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Circle Wallet] Error:', errorMessage);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage,
        message: 'Circle Programmable Wallet operation failed.',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
