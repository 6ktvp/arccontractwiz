import { ContractConfig } from '@/types/contract';

// USDC contract address on Arc Testnet
const ARC_USDC_ADDRESS = '0x3600000000000000000000000000000000000000';

// Official Trusted Forwarder for Arc Testnet (Circle Wallets)
const ARC_TRUSTED_FORWARDER = '0x71bE63fcc4540BE48f49BA3371Ca0670355f3068';

// Convert USDC decimal value to 6 decimals integer
function convertUsdcToWei(value: string): string {
  if (!value || value === '') return '0';
  const num = parseFloat(value);
  if (isNaN(num)) return '0';
  // Multiply by 1e6 and round to avoid floating point issues
  return Math.round(num * 1000000).toString();
}

export function generateERC721Contract(config: ContractConfig): string {
  const imports: string[] = [
    '@openzeppelin/contracts/token/ERC721/ERC721.sol',
  ];
  
  const extensions: string[] = ['ERC721'];
  const functions: string[] = [];
  const interfaces: string[] = [];
  const stateVars: string[] = [];
  const constructorBody: string[] = [];
  const overrides: string[] = [];
  
  // ERC2771Context for gasless (Arc Gasless or nativeUsdcGas)
  const useGasless = config.arcGasless || config.nativeUsdcGas;
  if (useGasless) {
    imports.push('@openzeppelin/contracts/metatx/ERC2771Context.sol');
    extensions.push('ERC2771Context');
  }
  
  // Burnable
  if (config.burnable) {
    imports.push('@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol');
    extensions.push('ERC721Burnable');
  }
  
  // Pausable
  if (config.pausable) {
    imports.push('@openzeppelin/contracts/security/Pausable.sol');
    extensions.push('Pausable');
    functions.push(`
    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }`);
  }
  
  // Ownable
  if (config.ownable) {
    imports.push('@openzeppelin/contracts/access/Ownable.sol');
    extensions.push('Ownable');
  }

  // ERC-2981 Royalties
  if (config.enableRoyalties) {
    imports.push('@openzeppelin/contracts/token/common/ERC2981.sol');
    extensions.push('ERC2981');
    
    const receiver = config.royaltyReceiver || '_msgSender()';
    constructorBody.push(`        _setDefaultRoyalty(${receiver === '_msgSender()' ? receiver : `${receiver}`}, ${config.royaltyPercent});`);
    
    overrides.push('ERC2981');
  }

  // Base URI handling
  if (config.baseUriMode === 'fixed') {
    const baseUri = config.baseUri || '';
    stateVars.push(`    string private constant BASE_TOKEN_URI = "${baseUri}";`);
    functions.push(`
    function _baseURI() internal pure override returns (string memory) {
        return BASE_TOKEN_URI;
    }`);
  } else if (config.baseUriMode === 'modifiable') {
    stateVars.push(`    string private _baseTokenURI;`);
    const baseUri = config.baseUri || '';
    constructorBody.push(`        _baseTokenURI = "${baseUri}";`);
    functions.push(`
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    function setBaseURI(string memory newURI) external onlyOwner {
        _baseTokenURI = newURI;
    }`);
  }

  // Reveal System
  if (config.enableReveal) {
    if (config.baseUriMode !== 'modifiable') {
      stateVars.push(`    string private _baseTokenURI;`);
    }
    stateVars.push(`    string private _hiddenURI;`);
    stateVars.push(`    bool public revealed = false;`);
    
    imports.push('@openzeppelin/contracts/utils/Strings.sol');
    
    if (config.hiddenUri) {
      constructorBody.push(`        _hiddenURI = "${config.hiddenUri}";`);
    }
    
    const baseURIIndex = functions.findIndex(f => f.includes('function _baseURI'));
    if (baseURIIndex > -1) {
      functions.splice(baseURIIndex, 1);
    }
    
    functions.push(`
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        if (!revealed) {
            return _hiddenURI;
        }
        return string(abi.encodePacked(_baseTokenURI, Strings.toString(tokenId)));
    }

    function setBaseURI(string memory newURI) external onlyOwner {
        _baseTokenURI = newURI;
    }

    function setHiddenURI(string memory hidden) external onlyOwner {
        _hiddenURI = hidden;
    }

    function reveal() external onlyOwner {
        revealed = true;
    }`);
  }
  
  // Mintable with USDC payment support
  if (config.mintable) {
    stateVars.push(`    uint256 private _nextTokenId = ${config.startTokenId};`);
    
    if (config.maxSupply) {
      stateVars.push(`    uint256 public constant MAX_SUPPLY = ${config.maxSupply};`);
    }

    // Wallet limit for publicWithLimit
    if (config.mintAccessMode === 'publicWithLimit' && config.maxPerWallet) {
      stateVars.push(`    mapping(address => uint256) public minted;`);
      stateVars.push(`    uint256 public constant MAX_PER_WALLET = ${config.maxPerWallet};`);
    }

    // Paid mint
    const isPaidMint = config.enablePaidMint && config.mintAccessMode !== 'onlyOwner' && config.mintPrice;
    if (isPaidMint) {
      const priceInWei = convertUsdcToWei(config.mintPrice);
      stateVars.push(`    uint256 public mintPrice = ${priceInWei};`);
    }
    
    const modifier = config.mintAccessMode === 'onlyOwner' && config.ownable ? 'onlyOwner ' : '';
    
    let mintChecks = '';
    
    if (config.pausable) {
      mintChecks += `        require(!paused(), "Contract is paused");\n`;
    }
    
    if (config.maxSupply) {
      const comparison = config.startTokenId === 1 ? '<=' : '<';
      mintChecks += `        require(_nextTokenId ${comparison} MAX_SUPPLY, "Max supply reached");\n`;
    }
    
    if (config.mintAccessMode === 'publicWithLimit' && config.maxPerWallet) {
      mintChecks += `        require(minted[_msgSender()] < MAX_PER_WALLET, "Mint limit reached");\n`;
      mintChecks += `        minted[_msgSender()]++;\n`;
    }
    
    if (isPaidMint) {
      mintChecks += `        require(USDC.transferFrom(_msgSender(), address(this), mintPrice), "USDC payment failed");\n`;
    }
    
    functions.push(`
    function safeMint(address to) public ${modifier}{
${mintChecks}        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
    }`);

    // Withdraw function for paid mints (USDC) - ALWAYS add if paid mint is enabled
    if (isPaidMint && config.ownable) {
      functions.push(`
    function withdraw() external onlyOwner {
        uint256 balance = USDC.balanceOf(address(this));
        require(balance > 0, "No USDC to withdraw");
        require(USDC.transfer(owner(), balance), "USDC transfer failed");
    }`);
    }
  }

  // Pausable hook
  if (config.pausable) {
    functions.push(`
    function _update(address to, uint256 tokenId, address auth)
        internal
        override
        whenNotPaused
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }`);
  }

  // supportsInterface override for ERC2981
  if (config.enableRoyalties) {
    functions.push(`
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC2981)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }`);
  }

  // ERC2771Context overrides for gasless
  if (useGasless) {
    functions.push(`
    function _msgSender() internal view override(Context, ERC2771Context) returns (address) {
        return ERC2771Context._msgSender();
    }

    function _msgData() internal view override(Context, ERC2771Context) returns (bytes calldata) {
        return ERC2771Context._msgData();
    }

    function _contextSuffixLength() internal view override(Context, ERC2771Context) returns (uint256) {
        return ERC2771Context._contextSuffixLength();
    }`);
  }
  
  const importsStr = imports.map(i => `import "${i}";`).join('\n');
  const extensionsStr = extensions.join(', ');
  
  const ownableConstructor = config.ownable ? ' Ownable(_msgSender())' : '';
  const gaslessConstructor = useGasless ? ` ERC2771Context(${ARC_TRUSTED_FORWARDER})` : '';
  
  // IERC20 interface
  const ierc20Interface = `
interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}`;

  // USDC constant
  const circleUsdcVar = `    IERC20 public constant USDC = IERC20(${ARC_USDC_ADDRESS});`;
  const finalStateVars = stateVars.length > 0 
    ? '\n' + circleUsdcVar + '\n' + stateVars.join('\n') + '\n'
    : '\n' + circleUsdcVar + '\n';

  const constructorBodyStr = constructorBody.length > 0 ? '\n' + constructorBody.join('\n') : '';
  const functionsStr = functions.join('\n');

return `// SPDX-License-Identifier: MIT
/**
 * @title Circle-Compatible Smart Contract
 * @notice ERC721 contract compatible with Circle Programmable Wallets and USDC payments
 * @dev ${useGasless ? 'Includes ERC-2771 for gasless meta-transactions via Circle Wallets. ' : ''}Trusted Forwarder: ${ARC_TRUSTED_FORWARDER}
 * @custom:network Arc Testnet (Chain ID: 5042002)
 */
pragma solidity >=0.8.20 <0.9.0;

${importsStr}
${ierc20Interface}

contract ${config.name} is ${extensionsStr} {${finalStateVars}
    constructor() ERC721("${config.name}", "${config.symbol}")${gaslessConstructor}${ownableConstructor} {${constructorBodyStr}
    }
${functionsStr}
}
`;
}

export function generateERC1155Contract(config: ContractConfig): string {
  const imports: string[] = [
    '@openzeppelin/contracts/token/ERC1155/ERC1155.sol',
  ];
  
  const extensions: string[] = ['ERC1155'];
  const functions: string[] = [];
  const stateVars: string[] = [];
  
  // ERC2771Context for gasless - ALWAYS include for Arc compatibility
  const useGasless = config.arcGasless || config.nativeUsdcGas;
  if (useGasless) {
    imports.push('@openzeppelin/contracts/metatx/ERC2771Context.sol');
    extensions.push('ERC2771Context');
  }
  
  // Burnable
  if (config.burnable) {
    imports.push('@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol');
    extensions.push('ERC1155Burnable');
  }
  
  // Pausable
  if (config.pausable) {
    imports.push('@openzeppelin/contracts/security/Pausable.sol');
    extensions.push('Pausable');
    functions.push(`
    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }`);
  }
  
  // Ownable - ALWAYS include for Arc integration
  if (config.ownable) {
    imports.push('@openzeppelin/contracts/access/Ownable.sol');
    extensions.push('Ownable');
  }

  // Base URI setter
  if (config.baseUri) {
    functions.push(`
    function setURI(string memory newuri) public ${config.ownable ? 'onlyOwner' : ''} {
        _setURI(newuri);
    }`);
  }

  // ALWAYS add USDC interface and variable for Arc
  stateVars.push(`    // Arc Testnet Native USDC`);
  stateVars.push(`    IERC20 public constant USDC = IERC20(${ARC_USDC_ADDRESS});`);

  // Wallet limit mapping (per wallet per token ID) - for publicWithLimit mode
  if (config.mintAccessMode === 'publicWithLimit' && config.maxPerWallet) {
    stateVars.push(`    // Tracks: wallet address => token ID => amount minted`);
    stateVars.push(`    mapping(address => mapping(uint256 => uint256)) public mintedPerWallet;`);
    stateVars.push(`    uint256 public constant MAX_PER_WALLET_PER_ID = ${config.maxPerWallet};`);
  }

  // Paid mint - add mintPrice variable
  const isPaidMint = config.enablePaidMint && config.mintAccessMode !== 'onlyOwner' && config.mintPrice;
  if (isPaidMint) {
    const priceInWei = convertUsdcToWei(config.mintPrice);
    stateVars.push(`    // Mint price in USDC (6 decimals)`);
    stateVars.push(`    uint256 public mintPrice = ${priceInWei};`);
  }
  
  // Mintable functions
  if (config.mintable) {
    // Determine access modifier based on mode
    const isOnlyOwner = config.mintAccessMode === 'onlyOwner' && config.ownable;
    const modifier = isOnlyOwner ? 'onlyOwner ' : '';
    
    let mintChecks = '';
    
    // Pause check
    if (config.pausable) {
      mintChecks += `        require(!paused(), "Contract is paused");\n`;
    }
    
    // Wallet limit check (per Token ID for ERC-1155)
    if (config.mintAccessMode === 'publicWithLimit' && config.maxPerWallet) {
      mintChecks += `        require(mintedPerWallet[_msgSender()][id] + amount <= MAX_PER_WALLET_PER_ID, "Limit reached for this token ID");\n`;
      mintChecks += `        mintedPerWallet[_msgSender()][id] += amount;\n`;
    }
    
    // USDC payment (price * amount for ERC-1155)
    if (isPaidMint) {
      mintChecks += `        require(USDC.transferFrom(_msgSender(), address(this), mintPrice * amount), "USDC payment failed");\n`;
    }
    
    functions.push(`
    /**
     * @notice Mint tokens - ${isOnlyOwner ? 'Only Owner' : config.mintAccessMode === 'publicWithLimit' ? 'Public with wallet limit per token ID' : isPaidMint ? 'Public with USDC payment' : 'Public'}
     * @param account Recipient address
     * @param id Token ID to mint
     * @param amount Amount of tokens to mint
     * @param data Additional data
     */
    function mint(address account, uint256 id, uint256 amount, bytes memory data) public ${modifier}{
${mintChecks}        _mint(account, id, amount, data);
    }

    /**
     * @notice Batch mint - ALWAYS onlyOwner for security
     */
    function mintBatch(
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) public onlyOwner {
${config.pausable ? `        require(!paused(), "Contract is paused");\n` : ''}        _mintBatch(to, ids, amounts, data);
    }`);

    // Withdraw function for paid mints (USDC)
    if (isPaidMint && config.ownable) {
      functions.push(`
    /**
     * @notice Withdraw collected USDC to owner
     */
    function withdraw() external onlyOwner {
        uint256 balance = USDC.balanceOf(address(this));
        require(balance > 0, "No USDC to withdraw");
        require(USDC.transfer(owner(), balance), "USDC transfer failed");
    }`);
    }
  }

  // Pausable hook
  if (config.pausable) {
    functions.push(`
    function _update(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory values
    ) internal override whenNotPaused {
        super._update(from, to, ids, values);
    }`);
  }

  // ERC2771Context overrides - REQUIRED for gasless to work
  if (useGasless) {
    functions.push(`
    /**
     * @dev ERC2771Context overrides for Circle Wallet gasless transactions
     */
    function _msgSender() internal view override(Context, ERC2771Context) returns (address) {
        return ERC2771Context._msgSender();
    }

    function _msgData() internal view override(Context, ERC2771Context) returns (bytes calldata) {
        return ERC2771Context._msgData();
    }

    function _contextSuffixLength() internal view override(Context, ERC2771Context) returns (uint256) {
        return ERC2771Context._contextSuffixLength();
    }`);
  }
  
  const importsStr = imports.map(i => `import "${i}";`).join('\n');
  const extensionsStr = extensions.join(', ');
  const functionsStr = functions.join('\n');
  
  // Constructor parameters - ALWAYS include ERC2771Context with Arc Forwarder when gasless is enabled
  const gaslessConstructor = useGasless ? ` ERC2771Context(${ARC_TRUSTED_FORWARDER})` : '';
  const ownableConstructor = config.ownable ? ' Ownable(_msgSender())' : '';
  const uri = config.baseUri || '';
  
  const stateVarsStr = stateVars.length > 0 ? '\n' + stateVars.join('\n') + '\n' : '';

return `// SPDX-License-Identifier: MIT
/**
 * @title ${config.name} - Circle-Compatible ERC1155
 * @notice ERC1155 Multi-Token contract for Arc Network with Circle Wallet integration
 * @dev ${useGasless ? 'Includes ERC-2771 for gasless meta-transactions via Circle Wallets. ' : ''}Trusted Forwarder: ${ARC_TRUSTED_FORWARDER}
 * @custom:network Arc Testnet (Chain ID: 5042002)
 * @custom:usdc ${ARC_USDC_ADDRESS}
 */
pragma solidity >=0.8.20 <0.9.0;

${importsStr}

interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract ${config.name} is ${extensionsStr} {${stateVarsStr}
    /**
     * @notice Constructor
     * @dev Initializes ERC1155 with URI${useGasless ? ', ERC2771Context with Arc Trusted Forwarder' : ''}${config.ownable ? ', and Ownable with deployer as owner' : ''}
     */
    constructor() ERC1155("${uri}")${gaslessConstructor}${ownableConstructor} {}
${functionsStr}
}
`;
}

export function generateERC20Contract(config: ContractConfig): string {
  const imports: string[] = [
    '@openzeppelin/contracts/token/ERC20/ERC20.sol',
  ];
  
  const extensions: string[] = ['ERC20'];
  const functions: string[] = [];
  const stateVars: string[] = [];
  const constructorBody: string[] = [];
  
  // ERC2771Context for gasless
  const useGasless = config.arcGasless || config.nativeUsdcGas;
  if (useGasless) {
    imports.push('@openzeppelin/contracts/metatx/ERC2771Context.sol');
    extensions.push('ERC2771Context');
  }
  
  // Burnable
  if (config.burnable) {
    imports.push('@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol');
    extensions.push('ERC20Burnable');
  }
  
  // Pausable
  if (config.pausable) {
    imports.push('@openzeppelin/contracts/security/Pausable.sol');
    extensions.push('Pausable');
    functions.push(`
    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }`);
  }
  
  // Ownable
  if (config.ownable) {
    imports.push('@openzeppelin/contracts/access/Ownable.sol');
    extensions.push('Ownable');
  }

  // Permit (EIP-2612)
  if (config.permit) {
    imports.push('@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol');
    extensions.push('ERC20Permit');
  }

  // Initial supply
  if (config.initialSupply) {
    const decimals = config.decimals || 18;
    constructorBody.push(`        _mint(_msgSender(), ${config.initialSupply} * 10 ** ${decimals});`);
  }

  // Custom decimals
  if (config.decimals !== 18) {
    functions.push(`
    function decimals() public pure override returns (uint8) {
        return ${config.decimals};
    }`);
  }
  
  // Mintable - ERC-20 mint is always onlyOwner
  if (config.mintable) {
    const modifier = config.ownable ? 'onlyOwner ' : '';
    const pauseCheck = config.pausable 
      ? `        require(!paused(), "Contract is paused");\n` 
      : '';
    
    functions.push(`
    function mint(address to, uint256 amount) public ${modifier}{
${pauseCheck}        _mint(to, amount);
    }`);
  }

  // Pausable hook
  if (config.pausable) {
    functions.push(`
    function _update(address from, address to, uint256 value)
        internal
        override
        whenNotPaused
    {
        super._update(from, to, value);
    }`);
  }

  // ERC2771Context overrides - ALWAYS add when gasless is enabled
  if (useGasless) {
    functions.push(`
    function _msgSender() internal view override(Context, ERC2771Context) returns (address) {
        return ERC2771Context._msgSender();
    }

    function _msgData() internal view override(Context, ERC2771Context) returns (bytes calldata) {
        return ERC2771Context._msgData();
    }

    function _contextSuffixLength() internal view override(Context, ERC2771Context) returns (uint256) {
        return ERC2771Context._contextSuffixLength();
    }`);
  }
  
  const importsStr = imports.map(i => `import "${i}";`).join('\n');
  const extensionsStr = extensions.join(', ');
  const constructorBodyStr = constructorBody.length > 0 ? '\n' + constructorBody.join('\n') : '';
  const functionsStr = functions.join('\n');
  const stateVarsStr = stateVars.length > 0 ? '\n' + stateVars.join('\n') + '\n' : '';
  
  // Constructor with proper trusted forwarder
  const gaslessConstructor = useGasless ? ` ERC2771Context(${ARC_TRUSTED_FORWARDER})` : '';
  const ownableConstructor = config.ownable ? ' Ownable(_msgSender())' : '';
  const permitConstructor = config.permit ? ` ERC20Permit("${config.name}")` : '';

return `// SPDX-License-Identifier: MIT
/**
 * @title Circle-Compatible Smart Contract
 * @notice ERC20 contract compatible with Circle Programmable Wallets
 * @dev ${config.permit ? 'Includes EIP-2612 Permit for gasless approvals. ' : ''}${useGasless ? 'Includes ERC-2771 for meta-transactions. ' : ''}Trusted Forwarder: ${ARC_TRUSTED_FORWARDER}
 * @custom:network Arc Testnet (Chain ID: 5042002)
 */
pragma solidity >=0.8.20 <0.9.0;

${importsStr}

contract ${config.name} is ${extensionsStr} {${stateVarsStr}
    constructor() ERC20("${config.name}", "${config.symbol}")${gaslessConstructor}${ownableConstructor}${permitConstructor} {${constructorBodyStr}
    }
${functionsStr}
}
`;
}

export function generateX420Contract(config: ContractConfig): string {
  const imports: string[] = [
    '@openzeppelin/contracts/token/ERC721/ERC721.sol',
    '@openzeppelin/contracts/utils/Strings.sol',
  ];
  
  const extensions: string[] = ['ERC721'];
  const functions: string[] = [];
  const stateVars: string[] = [];
  const constructorBody: string[] = [];
  
  // ERC2771Context for gasless - X420 also supports gasless
  const useGasless = config.arcGasless || config.nativeUsdcGas;
  if (useGasless) {
    imports.push('@openzeppelin/contracts/metatx/ERC2771Context.sol');
    extensions.push('ERC2771Context');
  }
  
  // Burnable
  if (config.burnable) {
    imports.push('@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol');
    extensions.push('ERC721Burnable');
  }
  
  // Pausable
  if (config.pausable) {
    imports.push('@openzeppelin/contracts/security/Pausable.sol');
    extensions.push('Pausable');
    functions.push(`
    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }`);
  }
  
  // Ownable
  if (config.ownable) {
    imports.push('@openzeppelin/contracts/access/Ownable.sol');
    extensions.push('Ownable');
  }

  // X420-specific state variables
  stateVars.push(`    uint256 private _nextTokenId = 1;`);
  stateVars.push(`    uint8 public constant MAX_RECURSION_DEPTH = ${config.recursionDepth || 3};`);
  stateVars.push(`    string public constant CONTENT_TYPE = "${config.contentType || 'image'}";`);
  stateVars.push(`    mapping(uint256 => uint256[]) private _references;`);
  stateVars.push(`    mapping(uint256 => string) private _contentURIs;`);
  stateVars.push(`    string private _baseTokenURI;`);

  // Paid mint support
  const isPaidMint = config.enablePaidMint && config.mintAccessMode !== 'onlyOwner' && config.mintPrice;
  if (isPaidMint) {
    const priceInWei = convertUsdcToWei(config.mintPrice);
    stateVars.push(`    uint256 public mintPrice = ${priceInWei};`);
  }

  // X420-specific functions with _msgSender()
  functions.push(`
    /**
     * @notice Set the content URI for a token (owner only)
     * @param tokenId The token ID to set content for
     * @param uri The content URI (IPFS, Arweave, etc.)
     */
    function setContentURI(uint256 tokenId, string memory uri) external {
        require(ownerOf(tokenId) == _msgSender(), "Not token owner");
        _contentURIs[tokenId] = uri;
    }

    /**
     * @notice Add a recursive reference to another token
     * @param tokenId The source token ID
     * @param referencedTokenId The token ID to reference
     */
    function addReference(uint256 tokenId, uint256 referencedTokenId) external {
        require(ownerOf(tokenId) == _msgSender(), "Not token owner");
        require(_references[tokenId].length < MAX_RECURSION_DEPTH, "Max recursion depth reached");
        _requireOwned(referencedTokenId);
        _references[tokenId].push(referencedTokenId);
    }

    /**
     * @notice Get all references for a token
     * @param tokenId The token ID to query
     * @return Array of referenced token IDs
     */
    function getReferences(uint256 tokenId) external view returns (uint256[] memory) {
        _requireOwned(tokenId);
        return _references[tokenId];
    }

    /**
     * @notice Resolve recursive content URIs up to specified depth
     * @param tokenId The starting token ID
     * @param depth The recursion depth (max: MAX_RECURSION_DEPTH)
     * @return Array of content URIs following the reference chain
     */
    function resolveRecursive(uint256 tokenId, uint8 depth) external view returns (string[] memory) {
        require(depth <= MAX_RECURSION_DEPTH, "Depth exceeds max");
        _requireOwned(tokenId);
        
        string[] memory uris = new string[](depth + 1);
        uris[0] = _contentURIs[tokenId];
        
        uint256 currentToken = tokenId;
        for (uint8 i = 1; i <= depth; i++) {
            uint256[] memory refs = _references[currentToken];
            if (refs.length == 0) break;
            currentToken = refs[0];
            uris[i] = _contentURIs[currentToken];
        }
        
        return uris;
    }

    /**
     * @notice Returns the token URI for marketplace and wallet visualization
     * @dev Overrides ERC721 tokenURI - ESSENTIAL for X420 compatibility with ERC-721 standard
     * @dev This enables image display in OpenSea, Rarible, Circle Wallets, and other NFT platforms
     * @param tokenId The token ID to query
     * @return The content URI or base URI + tokenId
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        
        // Return content URI if set (primary X420 behavior)
        string memory contentUri = _contentURIs[tokenId];
        if (bytes(contentUri).length > 0) {
            return contentUri;
        }
        
        // Fallback to baseURI + tokenId for standard ERC-721 behavior
        string memory base = _baseTokenURI;
        if (bytes(base).length > 0) {
            return string(abi.encodePacked(base, Strings.toString(tokenId)));
        }
        
        return "";
    }

    /**
     * @notice Set the base URI for token metadata (onlyOwner)
     * @param newURI The new base URI
     */
    function setBaseURI(string memory newURI) external onlyOwner {
        _baseTokenURI = newURI;
    }`);
  
  // Mintable with USDC payment
  if (config.mintable) {
    const modifier = config.ownable ? 'onlyOwner ' : '';
    let mintChecks = '';
    
    if (config.pausable) {
      mintChecks += `        require(!paused(), "Contract is paused");\n`;
    }
    
    if (isPaidMint) {
      mintChecks += `        require(USDC.transferFrom(_msgSender(), address(this), mintPrice), "USDC payment failed");\n`;
    }
    
    functions.push(`
    function safeMint(address to, string memory contentUri) public ${modifier}returns (uint256) {
${mintChecks}        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _contentURIs[tokenId] = contentUri;
        return tokenId;
    }`);

    // Withdraw function for paid mints
    if (isPaidMint && config.ownable) {
      functions.push(`
    function withdraw() external onlyOwner {
        uint256 balance = USDC.balanceOf(address(this));
        require(balance > 0, "No USDC to withdraw");
        require(USDC.transfer(owner(), balance), "USDC transfer failed");
    }`);
    }
  }

  // Pausable hook
  if (config.pausable) {
    functions.push(`
    function _update(address to, uint256 tokenId, address auth)
        internal
        override
        whenNotPaused
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }`);
  }

  // ERC2771Context overrides for gasless
  if (useGasless) {
    functions.push(`
    function _msgSender() internal view override(Context, ERC2771Context) returns (address) {
        return ERC2771Context._msgSender();
    }

    function _msgData() internal view override(Context, ERC2771Context) returns (bytes calldata) {
        return ERC2771Context._msgData();
    }

    function _contextSuffixLength() internal view override(Context, ERC2771Context) returns (uint256) {
        return ERC2771Context._contextSuffixLength();
    }`);
  }
  
  const importsStr = imports.map(i => `import "${i}";`).join('\n');
  const extensionsStr = extensions.join(', ');
  const constructorBodyStr = constructorBody.length > 0 ? '\n' + constructorBody.join('\n') : '';
  const functionsStr = functions.join('\n');
  
  const gaslessConstructor = useGasless ? ` ERC2771Context(${ARC_TRUSTED_FORWARDER})` : '';
  const ownableConstructor = config.ownable ? ' Ownable(_msgSender())' : '';

  // Add Circle USDC constant for compatibility
  const circleUsdcVar = `    IERC20 public constant USDC = IERC20(${ARC_USDC_ADDRESS});`;
  const finalStateVars = '\n' + circleUsdcVar + '\n' + stateVars.join('\n') + '\n';

return `// SPDX-License-Identifier: MIT
/**
 * @title X420 Experimental NFT Contract
 * @notice Recursive content NFT with depth-based references compatible with Circle Wallets
 * @dev ${useGasless ? 'Includes ERC-2771 for gasless meta-transactions via Circle Wallets. ' : ''}Trusted Forwarder: ${ARC_TRUSTED_FORWARDER}
 * @custom:network Arc Testnet (Chain ID: 5042002)
 */
pragma solidity >=0.8.20 <0.9.0;

${importsStr}

interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract ${config.name} is ${extensionsStr} {${finalStateVars}
    constructor() ERC721("${config.name}", "${config.symbol}")${gaslessConstructor}${ownableConstructor} {${constructorBodyStr}
    }
${functionsStr}
}
`;
}

export function generateContract(config: ContractConfig): string {
  switch (config.type) {
    case 'ERC721':
      return generateERC721Contract(config);
    case 'ERC1155':
      return generateERC1155Contract(config);
    case 'ERC20':
      return generateERC20Contract(config);
    case 'X420':
      return generateX420Contract(config);
    default:
      return generateERC721Contract(config);
  }
}

// Gas estimation for Arc Testnet (simulated)
export function estimateGasCost(config: ContractConfig): {
  estimatedGas: number;
  estimatedCostUSDC: string;
  breakdown: { item: string; gas: number }[];
} {
  const breakdown: { item: string; gas: number }[] = [];
  let totalGas = 0;

  // Base deployment cost
  const baseDeployment = {
    'ERC721': 1200000,
    'ERC1155': 1100000,
    'ERC20': 800000,
    'X420': 1500000,
  };
  
  const base = baseDeployment[config.type] || 1200000;
  breakdown.push({ item: `${config.type} Base Deployment`, gas: base });
  totalGas += base;

  // Feature costs
  if (config.ownable) {
    breakdown.push({ item: 'Ownable', gas: 50000 });
    totalGas += 50000;
  }
  if (config.burnable) {
    breakdown.push({ item: 'Burnable', gas: 80000 });
    totalGas += 80000;
  }
  if (config.pausable) {
    breakdown.push({ item: 'Pausable', gas: 100000 });
    totalGas += 100000;
  }
  if (config.mintable) {
    breakdown.push({ item: 'Mintable', gas: 120000 });
    totalGas += 120000;
  }
  if (config.enableRoyalties && config.type === 'ERC721') {
    breakdown.push({ item: 'ERC-2981 Royalties', gas: 150000 });
    totalGas += 150000;
  }
  if (config.enableReveal && config.type === 'ERC721') {
    breakdown.push({ item: 'Reveal System', gas: 100000 });
    totalGas += 100000;
  }
  if (config.permit && config.type === 'ERC20') {
    breakdown.push({ item: 'Permit (EIP-2612)', gas: 180000 });
    totalGas += 180000;
  }
  if ((config.arcGasless || config.nativeUsdcGas)) {
    breakdown.push({ item: 'ERC-2771 Gasless (Circle)', gas: 200000 });
    totalGas += 200000;
  }
  if (config.enablePaidMint && config.mintPrice) {
    breakdown.push({ item: 'USDC Payment Logic', gas: 80000 });
    totalGas += 80000;
  }

  // Arc Testnet gas price: 20 Gwei = 0.00000002 USDC per gas unit
  const gasPriceUSDC = 0.00000002;
  const estimatedCost = totalGas * gasPriceUSDC;

  return {
    estimatedGas: totalGas,
    estimatedCostUSDC: estimatedCost.toFixed(4),
    breakdown,
  };
}

// README generator for markdown export
export function generateReadme(config: ContractConfig): string {
  const useGasless = config.arcGasless || config.nativeUsdcGas;
  const isPaidMint = config.enablePaidMint && config.mintAccessMode !== 'onlyOwner' && config.mintPrice;
  
  return `# ${config.name} - Smart Contract

## Network Configuration

| Property | Value |
|----------|-------|
| **Network** | Arc Testnet |
| **Chain ID** | 5042002 |
| **RPC URL** | https://rpc.testnet.arc.network |
| **USDC Address** | ${ARC_USDC_ADDRESS} |
| **Trusted Forwarder** | ${ARC_TRUSTED_FORWARDER} |

## Contract Type

**${config.type}** - ${config.symbol}

## Features

${config.ownable ? '- ✅ Ownable (Owner-controlled functions)\n' : ''}${config.mintable ? '- ✅ Mintable\n' : ''}${config.burnable ? '- ✅ Burnable\n' : ''}${config.pausable ? '- ✅ Pausable\n' : ''}${useGasless ? '- ✅ Gasless Transactions (ERC-2771 via Circle Wallets)\n' : ''}${isPaidMint ? `- ✅ Paid Mint (${config.mintPrice} USDC)\n` : ''}${config.enableRoyalties ? `- ✅ Royalties (${config.royaltyPercent / 100}%)\n` : ''}${config.permit ? '- ✅ Permit (EIP-2612 gasless approvals)\n' : ''}

## Deployment Steps

1. Open [Remix IDE](https://remix.ethereum.org)
2. Create a new file: \`${config.name}.sol\`
3. Paste the contract code
4. Compile with Solidity >=0.8.20
5. Connect MetaMask to Arc Testnet:
   - RPC: \`https://rpc.testnet.arc.network\`
   - Chain ID: \`5042002\`
6. Deploy using "Injected Provider"

## Circle Wallet Integration

${useGasless ? `This contract supports gasless transactions via Circle Programmable Wallets.
The Trusted Forwarder address \`${ARC_TRUSTED_FORWARDER}\` is configured in the constructor.

Users with Circle Wallets can:
- Mint NFTs without paying gas fees
- Transfer tokens gaslessly
- All transaction fees are sponsored by the Paymaster` : 'Gasless transactions are not enabled. Enable "Arc Gasless" to support Circle Wallets.'}

## USDC Integration

USDC Contract on Arc: \`${ARC_USDC_ADDRESS}\`

${isPaidMint ? `**Mint Price:** ${config.mintPrice} USDC

Users must approve the contract to spend USDC before minting.` : 'No USDC payment required for minting.'}

---

*Generated by ArcContractWiz - https://arccontractwiz.xyz*
`;
}
