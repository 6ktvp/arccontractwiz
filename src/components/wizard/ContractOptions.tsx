import { ContractConfig, BaseUriMode, MintAccess, ContentType } from '@/types/contract';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { 
  Flame, 
  Pause, 
  Coins, 
  Link, 
  Crown, 
  Eye, 
  Percent, 
  Hash,
  Wallet,
  DollarSign,
  Users,
  Settings,
  Shield,
  Zap,
  Layers,
  FileType,
  Fuel
} from 'lucide-react';
import { useState } from 'react';

interface ContractOptionsProps {
  config: ContractConfig;
  onChange: (config: Partial<ContractConfig>) => void;
}

interface OptionCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  children?: React.ReactNode;
}

function OptionCard({ icon, title, description, checked, onCheckedChange, children }: OptionCardProps) {
  return (
    <div className={cn(
      'rounded-lg border-2 p-4 transition-all duration-200',
      checked ? 'border-gold/50 bg-gold/5' : 'border-border bg-card'
    )}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-3">
          <div className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors',
            checked ? 'bg-gold/20 text-gold' : 'bg-secondary text-muted-foreground'
          )}>
            {icon}
          </div>
          <div>
            <h4 className="font-medium text-foreground">{title}</h4>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        <Switch checked={checked} onCheckedChange={onCheckedChange} />
      </div>
      {checked && children && (
        <div className="mt-4 border-t border-border pt-4">
          {children}
        </div>
      )}
    </div>
  );
}

interface SelectableCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  selected: boolean;
  onSelect: () => void;
  children?: React.ReactNode;
}

function SelectableCard({ icon, title, description, selected, onSelect, children }: SelectableCardProps) {
  return (
    <div 
      className={cn(
        'rounded-lg border-2 p-4 transition-all duration-200 cursor-pointer',
        selected ? 'border-gold/50 bg-gold/5' : 'border-border bg-card hover:border-border/80'
      )}
      onClick={onSelect}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors',
          selected ? 'bg-gold/20 text-gold' : 'bg-secondary text-muted-foreground'
        )}>
          {icon}
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-foreground">{title}</h4>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <div className={cn(
          'w-4 h-4 rounded-full border-2 transition-colors mt-1',
          selected ? 'border-gold bg-gold' : 'border-muted-foreground'
        )} />
      </div>
      {selected && children && (
        <div className="mt-4 border-t border-border pt-4" onClick={(e) => e.stopPropagation()}>
          {children}
        </div>
      )}
    </div>
  );
}

function AdvancedTokenIdSection({ config, onChange }: ContractOptionsProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-2">
          <Hash size={16} className="text-muted-foreground" />
          Token ID: Start at {config.startTokenId}
        </Label>
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-gold transition-colors"
        >
          <Settings size={14} />
          {showAdvanced ? 'Hide' : 'Advanced'}
        </button>
      </div>
      
      {showAdvanced && (
        <RadioGroup
          value={config.startTokenId.toString()}
          onValueChange={(value) => onChange({ startTokenId: parseInt(value) as 0 | 1 })}
          className="flex gap-4 pt-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="0" id="startAt0" />
            <Label htmlFor="startAt0" className="cursor-pointer text-sm">Start at 0</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="1" id="startAt1" />
            <Label htmlFor="startAt1" className="cursor-pointer text-sm">Start at 1</Label>
          </div>
        </RadioGroup>
      )}
    </div>
  );
}

export function ContractOptions({ config, onChange }: ContractOptionsProps) {
  const isERC721 = config.type === 'ERC721';
  const isERC1155 = config.type === 'ERC1155';
  const isERC20 = config.type === 'ERC20';
  const isX420 = config.type === 'X420';

  return (
    <div className="space-y-8">
      {/* Basic Info */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Basic Info</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Contract Name</Label>
            <Input
              id="name"
              placeholder="MyToken"
              value={config.name}
              onChange={(e) => onChange({ name: e.target.value })}
              className="bg-secondary border-border"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="symbol">Symbol</Label>
            <Input
              id="symbol"
              placeholder="MTK"
              value={config.symbol}
              onChange={(e) => onChange({ symbol: e.target.value })}
              className="bg-secondary border-border"
            />
          </div>
        </div>

        {/* ERC-20 Specific Fields */}
        {isERC20 && (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="decimals">Decimals</Label>
              <Input
                id="decimals"
                type="number"
                placeholder="18"
                min={0}
                max={18}
                value={config.decimals}
                onChange={(e) => onChange({ decimals: parseInt(e.target.value) || 18 })}
                className="bg-secondary border-border"
              />
              <p className="text-xs text-muted-foreground">
                Standard is 18 decimals (like ETH)
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="initialSupply">Initial Supply</Label>
              <Input
                id="initialSupply"
                type="text"
                placeholder="1000000"
                value={config.initialSupply}
                onChange={(e) => onChange({ initialSupply: e.target.value })}
                className="bg-secondary border-border"
              />
              <p className="text-xs text-muted-foreground">
                Tokens minted to deployer on creation
              </p>
            </div>
          </div>
        )}

        {/* X420 Specific Fields */}
        {isX420 && (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="recursionDepth" className="flex items-center gap-2">
                <Layers size={16} className="text-muted-foreground" />
                Recursion Depth
              </Label>
              <Input
                id="recursionDepth"
                type="number"
                placeholder="3"
                min={1}
                max={10}
                value={config.recursionDepth}
                onChange={(e) => onChange({ recursionDepth: parseInt(e.target.value) || 3 })}
                className="bg-secondary border-border"
              />
              <p className="text-xs text-muted-foreground">
                Max depth of recursive content references (1-10)
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="contentType" className="flex items-center gap-2">
                <FileType size={16} className="text-muted-foreground" />
                Content Type
              </Label>
              <Select
                value={config.contentType}
                onValueChange={(value) => onChange({ contentType: value as ContentType })}
              >
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue placeholder="Select content type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="audio">Audio</SelectItem>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="mixed">Mixed</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Primary content type for this X420 collection
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Base URI Section - ERC721 only */}
      {isERC721 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Base URI</h3>
          <div className="space-y-3">
            <SelectableCard
              icon={<Link size={20} />}
              title="No Base URI"
              description="Token URI will need to be set manually per token"
              selected={config.baseUriMode === 'none'}
              onSelect={() => onChange({ baseUriMode: 'none' })}
            />
            
            <SelectableCard
              icon={<Link size={20} />}
              title="Fixed Base URI"
              description="Constant URI that cannot be changed after deployment"
              selected={config.baseUriMode === 'fixed'}
              onSelect={() => onChange({ baseUriMode: 'fixed' })}
            >
              <div className="space-y-2">
                <Label htmlFor="baseUri">Base URI</Label>
                <Input
                  id="baseUri"
                  placeholder="https://api.example.com/metadata/"
                  value={config.baseUri}
                  onChange={(e) => onChange({ baseUri: e.target.value })}
                  className="bg-secondary border-border"
                />
                <p className="text-xs text-muted-foreground">
                  Token URI will be: baseURI + tokenId
                </p>
              </div>
            </SelectableCard>
            
            <SelectableCard
              icon={<Link size={20} />}
              title="Modifiable Base URI"
              description="Owner can update the Base URI after deployment"
              selected={config.baseUriMode === 'modifiable'}
              onSelect={() => onChange({ baseUriMode: 'modifiable' })}
            >
              <div className="space-y-2">
                <Label htmlFor="baseUriMod">Initial Base URI (optional)</Label>
                <Input
                  id="baseUriMod"
                  placeholder="https://api.example.com/metadata/"
                  value={config.baseUri}
                  onChange={(e) => onChange({ baseUri: e.target.value })}
                  className="bg-secondary border-border"
                />
                <p className="text-xs text-muted-foreground">
                  Can be changed later via setBaseURI() function
                </p>
              </div>
            </SelectableCard>
          </div>
        </div>
      )}

      {/* ERC1155 Base URI */}
      {isERC1155 && (
        <div className="space-y-2">
          <Label htmlFor="baseUri1155">Metadata URI</Label>
          <Input
            id="baseUri1155"
            placeholder="https://api.example.com/metadata/{id}.json"
            value={config.baseUri}
            onChange={(e) => onChange({ baseUri: e.target.value })}
            className="bg-secondary border-border"
          />
          <p className="text-xs text-muted-foreground">
            Use {'{id}'} placeholder for dynamic URIs
          </p>
        </div>
      )}

      {/* Core Features */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Core Features</h3>
        
        <OptionCard
          icon={<Crown size={20} />}
          title="Ownable"
          description="Restrict certain functions to the contract owner"
          checked={config.ownable}
          onCheckedChange={(checked) => onChange({ ownable: checked })}
        />

        <OptionCard
          icon={<Coins size={20} />}
          title="Mintable"
          description="Allow new tokens to be created"
          checked={config.mintable}
          onCheckedChange={(checked) => onChange({ mintable: checked })}
        />

        <OptionCard
          icon={<Flame size={20} />}
          title="Burnable"
          description="Allow token holders to destroy their tokens"
          checked={config.burnable}
          onCheckedChange={(checked) => onChange({ burnable: checked })}
        />

        <OptionCard
          icon={<Pause size={20} />}
          title="Pausable"
          description="Allow owner to pause all token transfers"
          checked={config.pausable}
          onCheckedChange={(checked) => onChange({ pausable: checked })}
        />

        {/* ERC-20 Specific Toggles */}
        {isERC20 && (
          <>
            <OptionCard
              icon={<Shield size={20} />}
              title="Permit (EIP-2612)"
              description="Gasless approvals using signatures"
              checked={config.permit}
              onCheckedChange={(checked) => onChange({ permit: checked })}
            />

            <OptionCard
              icon={<Zap size={20} />}
              title="Arc Gasless (ERC-2771)"
              description="Enable meta-transactions for gas sponsorship"
              checked={config.arcGasless}
              onCheckedChange={(checked) => onChange({ arcGasless: checked })}
            />
          </>
        )}
      </div>

      {/* Mint Options - ERC721 only */}
      {isERC721 && config.mintable && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Mint Options</h3>
          
          {/* Mint Access - Radio Group */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Users size={16} className="text-muted-foreground" />
              Mint Access
            </Label>
            
            <SelectableCard
              icon={<Crown size={20} />}
              title="Only Owner"
              description="Only the contract owner can mint tokens"
              selected={config.mintAccessMode === 'onlyOwner'}
              onSelect={() => onChange({ mintAccessMode: 'onlyOwner', enablePaidMint: false })}
            />
            
            <SelectableCard
              icon={<Coins size={20} />}
              title="Public"
              description="Anyone can mint tokens"
              selected={config.mintAccessMode === 'public'}
              onSelect={() => onChange({ mintAccessMode: 'public' })}
            />
            
            <SelectableCard
              icon={<Wallet size={20} />}
              title="Public with Wallet Limit"
              description="Anyone can mint, but limited per wallet"
              selected={config.mintAccessMode === 'publicWithLimit'}
              onSelect={() => onChange({ mintAccessMode: 'publicWithLimit' })}
            >
              <div className="space-y-2">
                <Label htmlFor="maxPerWallet">Max Mints Per Wallet</Label>
                <Input
                  id="maxPerWallet"
                  type="number"
                  placeholder="5"
                  value={config.maxPerWallet || ''}
                  onChange={(e) => onChange({ maxPerWallet: e.target.value ? parseInt(e.target.value) : null })}
                  className="bg-secondary border-border"
                />
              </div>
            </SelectableCard>
          </div>

      {/* Paid Mint - Separate Toggle - Not available for ERC-20 */}
          {!isERC20 && (
            <div className={cn(
              'rounded-lg border-2 p-4 transition-all duration-200',
              config.mintAccessMode === 'onlyOwner' ? 'opacity-50 pointer-events-none' : '',
              config.enablePaidMint ? 'border-gold/50 bg-gold/5' : 'border-border bg-card'
            )}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-3">
                  <div className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors',
                    config.enablePaidMint ? 'bg-gold/20 text-gold' : 'bg-secondary text-muted-foreground'
                  )}>
                    <DollarSign size={20} />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">Paid Mint (USDC)</h4>
                    <p className="text-sm text-muted-foreground">
                      {config.mintAccessMode === 'onlyOwner' 
                        ? 'Not available with "Only Owner" access' 
                        : 'Users must pay USDC to mint tokens'}
                    </p>
                  </div>
                </div>
                <Switch 
                  checked={config.enablePaidMint} 
                  onCheckedChange={(checked) => onChange({ enablePaidMint: checked })}
                  disabled={config.mintAccessMode === 'onlyOwner'}
                />
              </div>
              {config.enablePaidMint && config.mintAccessMode !== 'onlyOwner' && (
                <div className="mt-4 border-t border-border pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="mintPrice">Price per Mint (USDC)</Label>
                    <Input
                      id="mintPrice"
                      type="number"
                      step="0.000001"
                      placeholder="1.00"
                      value={config.mintPrice}
                      onChange={(e) => onChange({ mintPrice: e.target.value })}
                      className="bg-secondary border-border"
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter the price in USDC (e.g., 0.5, 1.25, 10). The system converts automatically to 6 decimals.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Max Supply */}
          <div className="space-y-2">
            <Label htmlFor="maxSupply">Max Supply (optional)</Label>
            <Input
              id="maxSupply"
              type="number"
              placeholder="10000"
              value={config.maxSupply || ''}
              onChange={(e) => onChange({ maxSupply: e.target.value ? parseInt(e.target.value) : null })}
              className="bg-secondary border-border"
            />
            <p className="text-xs text-muted-foreground">
              Maximum number of tokens that can be minted
            </p>
          </div>

          {/* Advanced Token ID */}
          <AdvancedTokenIdSection config={config} onChange={onChange} />
        </div>
      )}

      {/* Reveal System - ERC721 only */}
      {isERC721 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Advanced Features</h3>
          
          <OptionCard
            icon={<Eye size={20} />}
            title="Reveal System"
            description="Hide metadata until reveal (delayed reveal NFTs)"
            checked={config.enableReveal}
            onCheckedChange={(checked) => onChange({ enableReveal: checked })}
          >
            <div className="space-y-2">
              <Label htmlFor="hiddenUri">Hidden URI (Pre-reveal)</Label>
              <Input
                id="hiddenUri"
                placeholder="https://api.example.com/hidden.json"
                value={config.hiddenUri}
                onChange={(e) => onChange({ hiddenUri: e.target.value })}
                className="bg-secondary border-border"
              />
              <p className="text-xs text-muted-foreground">
                This URI is shown for all tokens until reveal() is called
              </p>
            </div>
          </OptionCard>

          <OptionCard
            icon={<Percent size={20} />}
            title="Creator Royalties (ERC-2981)"
            description="Set royalty fees for secondary sales"
            checked={config.enableRoyalties}
            onCheckedChange={(checked) => onChange({ enableRoyalties: checked })}
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="royaltyReceiver">Royalty Receiver Address</Label>
                <Input
                  id="royaltyReceiver"
                  placeholder="0x..."
                  value={config.royaltyReceiver}
                  onChange={(e) => onChange({ royaltyReceiver: e.target.value })}
                  className="bg-secondary border-border font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Leave empty to use deployer address (msg.sender)
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="royaltyPercent">Royalty Percentage (basis points)</Label>
                <Input
                  id="royaltyPercent"
                  type="number"
                  placeholder="500"
                  value={config.royaltyPercent || ''}
                  onChange={(e) => onChange({ royaltyPercent: e.target.value ? parseInt(e.target.value) : 0 })}
                  className="bg-secondary border-border"
                />
                <p className="text-xs text-muted-foreground">
                  500 = 5%, 1000 = 10%, 250 = 2.5%
                </p>
              </div>
            </div>
          </OptionCard>
        </div>
      )}

      {/* Global Gas Configuration */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Fuel size={20} className="text-gold" />
          Gas Logic
        </h3>
        
        <OptionCard
          icon={<DollarSign size={20} />}
          title="Native USDC Gas"
          description="Optimizes the contract so that the price of functions (such as mint) is calculated and charged directly in USDC"
          checked={config.nativeUsdcGas}
          onCheckedChange={(checked) => onChange({ nativeUsdcGas: checked })}
        >
          <p className="text-xs text-muted-foreground">
            Address: 0x3600000000000000000000000000000000000000 on the Arc Testnet
          </p>
        </OptionCard>

        <div className="space-y-2">
          <Label htmlFor="paymasterAddress" className="flex items-center gap-2">
            <Wallet size={16} className="text-muted-foreground" />
            Paymaster Address (Optional)
          </Label>
          <Input
            id="paymasterAddress"
            placeholder="0x..."
            value={config.paymasterAddress}
            onChange={(e) => onChange({ paymasterAddress: e.target.value })}
            className="bg-secondary border-border font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Address of the contract that will sponsor the user's transactions
          </p>
        </div>
      </div>

      {/* ARC Network Info */}
      <div className="rounded-lg border-2 border-gold/30 bg-gold/5 p-4">
        <div className="flex gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gold/20">
            <Hash size={20} className="text-gold" />
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-foreground">ARC Testnet Compatible</h4>
            <p className="text-sm text-muted-foreground mb-3">
              This contract is optimized for ARC Network. Deploy using the settings below:
            </p>
            <div className="grid gap-2 text-xs">
              <div className="flex justify-between py-1 border-b border-border/50">
                <span className="text-muted-foreground">Network Name</span>
                <span className="font-mono text-foreground">Arc Testnet</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/50">
                <span className="text-muted-foreground">Chain ID</span>
                <span className="font-mono text-foreground">5042002</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/50">
                <span className="text-muted-foreground">Native Currency</span>
                <span className="font-mono text-foreground">USDC</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/50">
                <span className="text-muted-foreground">RPC URL</span>
                <span className="font-mono text-foreground text-right break-all">https://rpc.testnet.arc.network</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">Block Explorer</span>
                <a 
                  href="https://testnet.arcscan.app" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="font-mono text-gold hover:underline"
                >
                  testnet.arcscan.app
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
