import logo from '@/assets/logo.png';
import { Sparkles, Code, Zap, Shield, Wallet } from 'lucide-react';

export function Header() {
  return (
    <header className="py-6 sm:py-8 space-y-4 sm:space-y-6">
      {/* Logo and Title */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
        <img src={logo} alt="Smart Contract Wizard" className="h-24 sm:h-32 md:h-40 w-auto object-contain" />
        <div className="flex flex-col text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold text-gold-gradient">Smart Contract Wizard</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Generate ERC-721 & ERC-1155 for ARC Network</p>
        </div>
      </div>

      {/* Description */}
      <div className="max-w-2xl mx-auto text-center space-y-4 px-2">
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          Create smart contracts for NFTs without writing code. Generate fully compliant 
          ERC-721 (unique NFTs) or ERC-1155 (multi-token) contracts with customizable 
          features, powered by OpenZeppelin security standards.
        </p>

        {/* Features */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3 pt-2">
          <div className="flex flex-col items-center gap-1 p-2 sm:p-3 rounded-lg bg-secondary/50 border border-border">
            <Code size={18} className="text-gold sm:w-5 sm:h-5" />
            <span className="text-[10px] sm:text-xs text-muted-foreground">No Coding</span>
          </div>
          <div className="flex flex-col items-center gap-1 p-2 sm:p-3 rounded-lg bg-secondary/50 border border-border">
            <Shield size={18} className="text-gold sm:w-5 sm:h-5" />
            <span className="text-[10px] sm:text-xs text-muted-foreground">OpenZeppelin</span>
          </div>
          <div className="flex flex-col items-center gap-1 p-2 sm:p-3 rounded-lg bg-secondary/50 border border-border">
            <Zap size={18} className="text-gold sm:w-5 sm:h-5" />
            <span className="text-[10px] sm:text-xs text-muted-foreground">ARC Ready</span>
          </div>
          <div className="flex flex-col items-center gap-1 p-2 sm:p-3 rounded-lg bg-secondary/50 border border-border">
            <Wallet size={18} className="text-gold sm:w-5 sm:h-5" />
            <span className="text-[10px] sm:text-xs text-muted-foreground text-center">Circle Wallets</span>
          </div>
          <div className="flex flex-col items-center gap-1 p-2 sm:p-3 rounded-lg bg-secondary/50 border border-border col-span-2 sm:col-span-1">
            <Sparkles size={18} className="text-gold sm:w-5 sm:h-5" />
            <span className="text-[10px] sm:text-xs text-muted-foreground">Customizable</span>
          </div>
        </div>
      </div>
    </header>
  );
}
