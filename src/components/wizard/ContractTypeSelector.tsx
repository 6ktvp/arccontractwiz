import { ContractType } from '@/types/contract';
import { cn } from '@/lib/utils';

interface ContractTypeSelectorProps {
  selected: ContractType;
  onChange: (type: ContractType) => void;
}

export function ContractTypeSelector({ selected, onChange }: ContractTypeSelectorProps) {
  const contractTypes: {
    type: ContractType;
    label: string;
    shortLabel: string;
    description: string;
    detail: string;
  }[] = [
    {
      type: 'ERC721',
      label: 'ERC-721',
      shortLabel: '721',
      description: 'Non-Fungible Token',
      detail: 'Unique collectibles, art, assets',
    },
    {
      type: 'ERC1155',
      label: 'ERC-1155',
      shortLabel: '1155',
      description: 'Multi-Token Standard',
      detail: 'Games, batch transfers, editions',
    },
    {
      type: 'ERC20',
      label: 'ERC-20',
      shortLabel: '20',
      description: 'Fungible Token',
      detail: 'Currencies, governance, utility',
    },
    {
      type: 'X420',
      label: 'X420',
      shortLabel: 'X420',
      description: 'Experimental Standard',
      detail: 'Recursive content, advanced NFTs',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {contractTypes.map((ct) => (
        <button
          key={ct.type}
          onClick={() => onChange(ct.type)}
          className={cn(
            'group relative flex flex-col items-center gap-3 rounded-lg border-2 p-4 md:p-6 transition-all duration-300',
            selected === ct.type
              ? 'border-gold bg-gold/10 gold-border-glow'
              : 'border-border bg-card hover:border-gold/50 hover:bg-card/80'
          )}
        >
          <div className={cn(
            'flex h-12 w-12 md:h-16 md:w-16 items-center justify-center rounded-full text-xl md:text-2xl font-bold transition-all',
            selected === ct.type ? 'bg-gold text-primary-foreground' : 'bg-secondary text-foreground'
          )}>
            {ct.shortLabel}
          </div>
          <div className="text-center">
            <h3 className={cn(
              'text-base md:text-lg font-semibold transition-colors',
              selected === ct.type ? 'text-gold' : 'text-foreground'
            )}>
              {ct.label}
            </h3>
            <p className="text-xs md:text-sm text-muted-foreground">{ct.description}</p>
            <p className="mt-1 text-xs text-muted-foreground hidden md:block">{ct.detail}</p>
          </div>
        </button>
      ))}
    </div>
  );
}
