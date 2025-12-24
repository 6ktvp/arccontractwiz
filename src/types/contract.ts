export type ContractType = 'ERC721' | 'ERC1155' | 'ERC20' | 'X420';

export type BaseUriMode = 'none' | 'fixed' | 'modifiable';

export type MintAccess = 'onlyOwner' | 'public' | 'publicWithLimit';

export type ContentType = 'image' | 'video' | 'audio' | 'text' | 'mixed';

export interface ContractConfig {
  type: ContractType;
  name: string;
  symbol: string;
  
  // Base URI
  baseUriMode: BaseUriMode;
  baseUri: string;
  
  // Core features
  mintable: boolean;
  burnable: boolean;
  pausable: boolean;
  ownable: boolean;
  
  // Mint options
  mintAccessMode: MintAccess;
  maxPerWallet: number | null;
  enablePaidMint: boolean;
  mintPrice: string;
  maxSupply: number | null;
  startTokenId: 0 | 1;
  
  // Reveal system
  enableReveal: boolean;
  hiddenUri: string;
  
  // Royalties ERC-2981
  enableRoyalties: boolean;
  royaltyReceiver: string;
  royaltyPercent: number;

  // ERC-20 specific
  decimals: number;
  initialSupply: string;
  permit: boolean;
  arcGasless: boolean;

  // X420 specific
  recursionDepth: number;
  contentType: ContentType;

  // Global Gas Configuration
  nativeUsdcGas: boolean;
  paymasterAddress: string;
}

export const defaultConfig: ContractConfig = {
  type: 'ERC721',
  name: 'MyToken',
  symbol: 'MTK',
  
  // Base URI
  baseUriMode: 'none',
  baseUri: '',
  
  // Core features
  mintable: true,
  burnable: false,
  pausable: false,
  ownable: true,
  
  // Mint options
  mintAccessMode: 'onlyOwner',
  maxPerWallet: null,
  enablePaidMint: false,
  mintPrice: '',
  maxSupply: null,
  startTokenId: 1,
  
  // Reveal system
  enableReveal: false,
  hiddenUri: '',
  
  // Royalties
  enableRoyalties: false,
  royaltyReceiver: '',
  royaltyPercent: 500,

  // ERC-20 specific
  decimals: 18,
  initialSupply: '',
  permit: false,
  arcGasless: false,

  // X420 specific
  recursionDepth: 3,
  contentType: 'image',

  // Global Gas Configuration
  nativeUsdcGas: false,
  paymasterAddress: '',
};
