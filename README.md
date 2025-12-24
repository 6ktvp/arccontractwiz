# Smart Contract Wizard

A web-based tool for generating ERC-721 and ERC-1155 smart contracts compatible with Circle Programmable Wallets and USDC payments on Arc Network.

## Features

- **ERC-721 Contract Generation**: Create NFT contracts with customizable options
- **ERC-1155 Contract Generation**: Create multi-token contracts
- **Circle Programmable Wallet Integration**: Full compatibility with Circle's wallet infrastructure
- **USDC Payments**: Native support for USDC-based minting on Arc Network
- **Modular Code Generation**: Only includes code for selected features

## Contract Options

### ERC-721
- Mintable, Burnable, Pausable
- Ownable access control
- Max Supply enforcement
- Base URI modes (None, Fixed, Modifiable)
- Mint Access (Owner Only, Public, Public with Limit)
- Paid Mint with USDC
- Reveal System
- ERC-2981 Royalties
- Token ID start position (0 or 1)

### ERC-1155
- Mintable, Burnable, Pausable
- Ownable access control
- Max Supply per token
- Configurable Base URI

## Arc Network

- **Chain ID**: 5042002
- **RPC**: https://rpc.testnet.arc.network
- **Explorer**: https://testnet.arcscan.app
- **USDC Contract**: 0x3600000000000000000000000000000000000000

## Technologies

- React + TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- ethers.js

## Development

```bash
npm install
npm run dev
```

## License

MIT
