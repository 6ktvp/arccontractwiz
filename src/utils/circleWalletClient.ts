/**
 * Circle Wallet Client
 * 
 * Frontend client for interacting with Circle Programmable Wallets
 * through the backend Edge Function.
 * 
 * ARCHITECTURE NOTES:
 * - Frontend NEVER has access to Circle API keys
 * - All signing happens server-side via Circle SDK
 * - This client only communicates with our Edge Function
 * - The Edge Function then communicates with Circle API
 * 
 * FLOW:
 * Frontend -> Edge Function -> Circle API -> Blockchain
 */

import { supabase } from '@/integrations/supabase/client';

// Types for Circle Wallet operations
export interface CircleWallet {
  id: string;
  address: string;
  blockchain: string;
  state: string;
  createDate: string;
}

export interface TransactionResult {
  id: string;
  state: string;
  txHash?: string;
  errorReason?: string;
}

export interface WalletBalance {
  token: {
    id: string;
    name: string;
    symbol: string;
    decimals: number;
  };
  amount: string;
}

/**
 * Circle Wallet Client Class
 * 
 * Handles all communication with Circle Programmable Wallets
 * through our secure backend API.
 */
export class CircleWalletClient {
  private walletSetId: string | null = null;
  
  /**
   * Creates a new Programmable Wallet for a user
   * 
   * FLOW:
   * 1. Frontend calls this method
   * 2. Backend generates idempotency key
   * 3. Backend calls Circle API to create wallet
   * 4. Circle creates wallet and returns details
   * 5. Backend returns wallet info to frontend
   * 
   * The private key is NEVER exposed - it lives in Circle's infrastructure
   */
  async createWallet(): Promise<{ wallet: CircleWallet; walletSetId: string }> {
    const { data, error } = await supabase.functions.invoke('circle-wallet', {
      body: {
        action: 'createProgrammableWallet',
      },
    });
    
    if (error) {
      throw new Error(`Failed to create wallet: ${error.message}`);
    }
    
    if (!data.success) {
      throw new Error(data.error || 'Unknown error creating wallet');
    }
    
    this.walletSetId = data.walletSetId;
    return {
      wallet: data.wallet,
      walletSetId: data.walletSetId,
    };
  }
  
  /**
   * Gets all wallets in a wallet set
   */
  async getWallets(walletSetId: string): Promise<CircleWallet[]> {
    const { data, error } = await supabase.functions.invoke('circle-wallet', {
      body: {
        action: 'getWallets',
        walletSetId,
      },
    });
    
    if (error) {
      throw new Error(`Failed to get wallets: ${error.message}`);
    }
    
    if (!data.success) {
      throw new Error(data.error || 'Unknown error getting wallets');
    }
    
    return data.wallets;
  }
  
  /**
   * Gets the balance of a wallet
   */
  async getWalletBalance(walletId: string): Promise<WalletBalance[]> {
    const { data, error } = await supabase.functions.invoke('circle-wallet', {
      body: {
        action: 'getWalletBalance',
        walletId,
      },
    });
    
    if (error) {
      throw new Error(`Failed to get balance: ${error.message}`);
    }
    
    if (!data.success) {
      throw new Error(data.error || 'Unknown error getting balance');
    }
    
    return data.balances;
  }
  
  /**
   * Executes a smart contract call
   * 
   * IMPORTANT: This is how you WRITE to the blockchain with Circle Wallets
   * 
   * FLOW:
   * 1. Frontend prepares call parameters (no signing!)
   * 2. Backend receives request
   * 3. Backend encodes the function call
   * 4. Backend sends to Circle API with Entity Secret
   * 5. Circle signs the transaction server-side
   * 6. Circle broadcasts to blockchain
   * 7. Transaction hash returned to frontend
   * 
   * @param walletId - The Circle wallet ID to sign with
   * @param contractAddress - The deployed contract address
   * @param abi - Contract ABI (array of function definitions)
   * @param functionName - Name of the function to call
   * @param args - Arguments to pass to the function
   * @param value - USDC value to send (optional, for payable functions)
   */
  async executeContractCall(params: {
    walletId: string;
    contractAddress: string;
    abi: string[];
    functionName: string;
    args: unknown[];
    value?: string; // USDC amount as string (e.g., "1.5" for 1.5 USDC)
  }): Promise<TransactionResult> {
    const { data, error } = await supabase.functions.invoke('circle-wallet', {
      body: {
        action: 'executeContractCall',
        ...params,
      },
    });
    
    if (error) {
      throw new Error(`Failed to execute contract call: ${error.message}`);
    }
    
    if (!data.success) {
      throw new Error(data.error || 'Unknown error executing contract call');
    }
    
    return data.transaction;
  }
  
  /**
   * Approves USDC spending for a contract
   * 
   * Required before calling payable functions that use USDC
   * 
   * @param walletId - The Circle wallet ID
   * @param spenderAddress - The contract that will spend USDC
   * @param amount - Amount to approve (in USDC, e.g., "100" for 100 USDC)
   */
  async approveUSDC(params: {
    walletId: string;
    spenderAddress: string;
    amount: string;
  }): Promise<TransactionResult> {
    const { data, error } = await supabase.functions.invoke('circle-wallet', {
      body: {
        action: 'approveUSDC',
        ...params,
      },
    });
    
    if (error) {
      throw new Error(`Failed to approve USDC: ${error.message}`);
    }
    
    if (!data.success) {
      throw new Error(data.error || 'Unknown error approving USDC');
    }
    
    return data.transaction;
  }
}

// Singleton instance for easy access
export const circleWallet = new CircleWalletClient();

/**
 * Example Usage:
 * 
 * // 1. Create a wallet for the user
 * const { wallet } = await circleWallet.createWallet();
 * console.log('Wallet address:', wallet.address);
 * 
 * // 2. Check balance
 * const balances = await circleWallet.getWalletBalance(wallet.id);
 * 
 * // 3. Approve USDC for NFT contract (if using paid mint)
 * await circleWallet.approveUSDC({
 *   walletId: wallet.id,
 *   spenderAddress: '0x...NFT_CONTRACT...',
 *   amount: '10', // 10 USDC
 * });
 * 
 * // 4. Mint an NFT
 * const result = await circleWallet.executeContractCall({
 *   walletId: wallet.id,
 *   contractAddress: '0x...NFT_CONTRACT...',
 *   abi: ['function mint(address to) external payable'],
 *   functionName: 'mint',
 *   args: [wallet.address],
 *   value: '1', // 1 USDC if payable
 * });
 * 
 * console.log('Transaction hash:', result.txHash);
 */
