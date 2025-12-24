import { useState } from 'react';
import { Copy, ExternalLink, Download, Check, Fuel, Globe, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ContractConfig } from '@/types/contract';
import { estimateGasCost, generateReadme } from '@/utils/generateContract';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface CodePreviewProps {
  code: string;
  contractName: string;
  config?: ContractConfig;
}

const ARC_RPC = 'https://rpc.testnet.arc.network';
const ARC_CHAIN_ID = '5042002';

export function CodePreview({ code, contractName, config }: CodePreviewProps) {
  const [copied, setCopied] = useState(false);
  const [rpcCopied, setRpcCopied] = useState(false);
  const [showGasModal, setShowGasModal] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success('Contract copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyRpc = async () => {
    const rpcData = `RPC URL: ${ARC_RPC}\nChain ID: ${ARC_CHAIN_ID}`;
    await navigator.clipboard.writeText(rpcData);
    setRpcCopied(true);
    toast.success('Arc RPC data copied!');
    setTimeout(() => setRpcCopied(false), 2000);
  };

  const handleOpenInRemix = () => {
    const base64Code = btoa(unescape(encodeURIComponent(code)));
    const remixUrl = `https://remix.ethereum.org/#code=${base64Code}&lang=en&optimize=false&runs=200&evmVersion=null`;
    window.open(remixUrl, '_blank');
    toast.success('Opening in Remix IDE...');
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${contractName}.sol`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`${contractName}.sol downloaded!`);
  };

  const handleDownloadWithReadme = () => {
    if (!config) {
      handleDownload();
      return;
    }

    // Create contract file
    const contractBlob = new Blob([code], { type: 'text/plain' });
    const contractUrl = URL.createObjectURL(contractBlob);
    const contractLink = document.createElement('a');
    contractLink.href = contractUrl;
    contractLink.download = `${contractName}.sol`;
    document.body.appendChild(contractLink);
    contractLink.click();
    document.body.removeChild(contractLink);
    URL.revokeObjectURL(contractUrl);

    // Create README file
    const readme = generateReadme(config);
    const readmeBlob = new Blob([readme], { type: 'text/markdown' });
    const readmeUrl = URL.createObjectURL(readmeBlob);
    const readmeLink = document.createElement('a');
    readmeLink.href = readmeUrl;
    readmeLink.download = `README.md`;
    document.body.appendChild(readmeLink);
    readmeLink.click();
    document.body.removeChild(readmeLink);
    URL.revokeObjectURL(readmeUrl);

    toast.success(`${contractName}.sol and README.md downloaded!`);
  };

  const gasEstimate = config ? estimateGasCost(config) : null;

  return (
    <div className="space-y-4">
      {/* Primary Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <Button
          onClick={handleCopy}
          variant="outline"
          className="flex-1 border-gold/30 bg-gold/10 text-gold hover:bg-gold/20 hover:border-gold/50"
        >
          {copied ? <Check size={18} className="mr-2" /> : <Copy size={18} className="mr-2" />}
          {copied ? 'Copied!' : 'Copy Contract'}
        </Button>
        
        <Button
          onClick={handleOpenInRemix}
          variant="outline"
          className="flex-1 border-gold/30 bg-gold/10 text-gold hover:bg-gold/20 hover:border-gold/50"
        >
          <ExternalLink size={18} className="mr-2" />
          Open in Remix
        </Button>
        
        <Button
          onClick={handleDownload}
          variant="outline"
          className="flex-1 border-gold/30 bg-gold/10 text-gold hover:bg-gold/20 hover:border-gold/50"
        >
          <Download size={18} className="mr-2" />
          Download .sol
        </Button>
        
        <Button
          onClick={() => window.open('https://thirdweb.com/contracts', '_blank')}
          variant="outline"
          className="flex-1 border-gold/30 bg-gold/10 text-gold hover:bg-gold/20 hover:border-gold/50"
        >
          <ExternalLink size={18} className="mr-2" />
          Import Thirdweb
        </Button>
      </div>

      {/* Secondary Action Buttons - Gas & Network */}
      <div className="flex flex-wrap gap-3">
        <Dialog open={showGasModal} onOpenChange={setShowGasModal}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="flex-1 border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/50"
            >
              <Fuel size={18} className="mr-2" />
              Preview Gas Cost
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-gold">Estimated Deployment Cost</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Gas estimation for Arc Testnet deployment
              </DialogDescription>
            </DialogHeader>
            {gasEstimate && (
              <div className="space-y-4">
                <div className="rounded-lg bg-secondary/50 p-4 border border-border">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-muted-foreground">Total Gas</span>
                    <span className="text-foreground font-mono text-lg">
                      ~{gasEstimate.estimatedGas.toLocaleString()} gas
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Estimated Cost</span>
                    <span className="text-gold font-bold text-xl">
                      ~${gasEstimate.estimatedCostUSDC} USDC
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-foreground">Cost Breakdown</h4>
                  <div className="rounded-lg bg-secondary/30 p-3 max-h-48 overflow-y-auto">
                    {gasEstimate.breakdown.map((item, index) => (
                      <div key={index} className="flex justify-between items-center py-1 text-sm">
                        <span className="text-muted-foreground">{item.item}</span>
                        <span className="text-foreground font-mono">
                          {item.gas.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <p className="text-xs text-muted-foreground">
                  * Estimates based on current Arc Testnet gas prices. Actual costs may vary.
                </p>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Button
          onClick={handleCopyRpc}
          variant="outline"
          className="flex-1 border-blue-500/30 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 hover:border-blue-500/50"
        >
          {rpcCopied ? <Check size={18} className="mr-2" /> : <Globe size={18} className="mr-2" />}
          {rpcCopied ? 'RPC Copied!' : 'Copy Arc RPC'}
        </Button>

        {config && (
          <Button
            onClick={handleDownloadWithReadme}
            variant="outline"
            className="flex-1 border-purple-500/30 bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 hover:border-purple-500/50"
          >
            <FileText size={18} className="mr-2" />
            Export with README
          </Button>
        )}
      </div>

      {/* Code Display */}
      <div className="relative rounded-lg border border-border bg-navy-dark overflow-hidden">
        <div className="flex items-center justify-between border-b border-border bg-secondary/50 px-4 py-2">
          <span className="text-sm font-medium text-muted-foreground">{contractName}.sol</span>
          <span className="text-xs text-muted-foreground">Solidity ≥0.8.20</span>
        </div>
        <div className="overflow-auto max-h-[500px]">
          <pre className="p-4 text-sm leading-relaxed">
            <code className="text-foreground font-mono whitespace-pre">{code}</code>
          </pre>
        </div>
      </div>

      {/* Help Text */}
      <div className="rounded-lg border border-border bg-card p-4">
        <h4 className="font-medium text-foreground mb-2">Next Steps</h4>
        <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
          <li>Copy the contract or open directly in Remix IDE</li>
          <li>Connect your wallet (MetaMask, Rabby, OKX)</li>
          <li>Select Arc Testnet network (Chain ID: {ARC_CHAIN_ID})</li>
          <li>Compile and deploy your contract</li>
        </ol>
        <div className="mt-3 p-3 rounded bg-secondary/50 text-xs text-muted-foreground space-y-1">
          <div>
            <strong className="text-gold">RPC URL:</strong> {ARC_RPC}
          </div>
          <div>
            <strong className="text-gold">Chain ID:</strong> {ARC_CHAIN_ID}
          </div>
          <div>
            <strong className="text-gold">Trusted Forwarder:</strong> 0x71bE63fcc4540BE48f49BA3371Ca0670355f3068
          </div>
        </div>
      </div>
    </div>
  );
}
