import { ArrowLeft, ExternalLink, Github, Twitter, Globe, FileCode, Zap, Users, Rocket, AlertTriangle, Fuel, Layers, Coins, Image, Video, Music } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Docs() {
  return (
    <div className="min-h-screen grid-background text-foreground">
      <div className="container max-w-4xl mx-auto px-4 py-12">
        {/* Back link */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-gold transition-colors mb-8"
        >
          <ArrowLeft size={16} />
          Back to Wizard
        </Link>

        {/* Header */}
        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gold mb-4">ArcContractWiz</h1>
          <p className="text-xl text-muted-foreground">Official Documentation (EN-US)</p>
        </header>

        {/* Overview */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <FileCode className="text-gold" size={24} />
            Overview
          </h2>
          <div className="bg-card/50 border border-border rounded-lg p-6 space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              ArcContractWiz is an open-source smart contract assistant designed to simplify the creation, configuration, and deployment-ready preparation of smart contracts on the <span className="text-gold font-semibold">Arc Testnet</span>.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              The project focuses on removing technical complexity for both developers and non-technical users by providing a guided, wizard-style experience for generating auditable, readable, and standards-compliant contracts, integrating:
            </p>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-center gap-2">
                <span className="text-gold">•</span> USDC-based payments
              </li>
              <li className="flex items-center gap-2">
                <span className="text-gold">•</span> Gasless infrastructure (ERC-2771)
              </li>
              <li className="flex items-center gap-2">
                <span className="text-gold">•</span> OpenZeppelin best practices
              </li>
              <li className="flex items-center gap-2">
                <span className="text-gold">•</span> No need to write Solidity code from scratch
              </li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              ArcContractWiz is <span className="font-semibold text-foreground">testnet-first</span>, focused on experimentation, learning, and efficient onboarding within the Arc ecosystem.
            </p>
          </div>
        </section>

        {/* Goals */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <Zap className="text-gold" size={24} />
            Goals
          </h2>
          <ul className="space-y-3">
            {[
              'Simplify Web3 onboarding for developers and non-technical users',
              'Reduce friction when creating and deploying smart contracts',
              'Standardize best practices on early-stage blockchain networks',
              'Accelerate Arc ecosystem adoption through practical tooling',
              'Enable safe testing of NFTs, tokens, and tokenomics'
            ].map((goal, i) => (
              <li key={i} className="flex items-start gap-3 text-muted-foreground">
                <span className="text-gold mt-1">•</span>
                {goal}
              </li>
            ))}
          </ul>
        </section>

        {/* Current Features */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-foreground mb-4">Current Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              'Step-by-step wizard-style contract creation flow',
              'ERC-721 (NFT) contract generation',
              'ERC-1155 (Multi-token NFT) contract generation',
              'ERC-20 utility token support',
              'Native USDC integration on Arc Testnet',
              'Fixed or configurable supply options (MAX_SUPPLY)',
              'Token ID configuration (starting at 1)',
              'Open-source, readable, and auditable code',
              'Remix-ready output'
            ].map((feature, i) => (
              <div key={i} className="bg-card/30 border border-border/50 rounded-lg px-4 py-3 text-muted-foreground">
                ✓ {feature}
              </div>
            ))}
          </div>
        </section>

        {/* Supported Contract Standards */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <Rocket className="text-gold" size={24} />
            🚀 Supported Contract Standards
          </h2>

          {/* X420 */}
          <div className="bg-card/50 border border-gold/30 rounded-lg p-6 mb-6">
            <h3 className="text-xl font-semibold text-gold mb-3 flex items-center gap-2">
              <Layers size={20} />
              1. X420 Recursive NFT (Experimental)
            </h3>
            <p className="text-muted-foreground mb-4">
              A proprietary ArcContractWiz standard designed for hierarchical and recursive NFT metadata, enabling advanced on-chain content composition.
            </p>
            <h4 className="text-foreground font-semibold mb-2">Key features:</h4>
            <ul className="space-y-3 text-muted-foreground mb-4">
              <li>
                <span className="font-semibold text-foreground">Controlled Recursion</span><br />
                Maximum reference depth defined via <code className="bg-background px-2 py-0.5 rounded text-gold">MAX_RECURSION_DEPTH</code> (configurable from 1 to 10)
              </li>
              <li>
                <span className="font-semibold text-foreground">Universal Compatibility</span><br />
                Overrides the <code className="bg-background px-2 py-0.5 rounded text-gold">tokenURI</code> function, ensuring compatibility with:
                <ul className="ml-4 mt-2 space-y-1">
                  <li>• ERC-721 marketplaces</li>
                  <li>• Compatible wallets</li>
                  <li>• Circle infrastructure</li>
                </ul>
              </li>
              <li>
                <span className="font-semibold text-foreground">Supported Media Types</span>
                <div className="flex gap-4 mt-2">
                  <span className="flex items-center gap-1"><Image size={16} className="text-gold" /> Image</span>
                  <span className="flex items-center gap-1"><Video size={16} className="text-gold" /> Video</span>
                  <span className="flex items-center gap-1"><Music size={16} className="text-gold" /> Audio</span>
                </div>
                <p className="text-sm mt-1">All defined directly within the smart contract</p>
              </li>
            </ul>
            <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <AlertTriangle size={16} className="text-destructive" />
                This standard is experimental and intended for testing, research, and innovation.
              </p>
            </div>
          </div>

          {/* ERC-721, ERC-1155, ERC-20 */}
          <div className="bg-card/50 border border-border rounded-lg p-6">
            <h3 className="text-xl font-semibold text-foreground mb-4">2. ERC-721, ERC-1155, and ERC-20</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gold mb-2">ERC-721 (NFT Collections)</h4>
                <ul className="text-muted-foreground space-y-1 ml-4">
                  <li>• Supply limits via MAX_SUPPLY</li>
                  <li>• Direct USDC payment integration</li>
                  <li>• Ideal for collections, badges, and utility NFTs</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-gold mb-2">ERC-1155 (Multi-token Standard)</h4>
                <ul className="text-muted-foreground space-y-1 ml-4">
                  <li>• Optimized for managing multiple assets within a single contract</li>
                  <li>• Supports mintBatch</li>
                  <li>• Ideal for games, passes, items, and experimentation</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-gold mb-2">ERC-20 (Utility Token)</h4>
                <ul className="text-muted-foreground space-y-1 ml-4">
                  <li>• Supports Permit (EIP-2612)</li>
                  <li>• Signature-based approvals without gas costs</li>
                  <li>• Ideal for tokenomics testing and future integrations</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Gas Infrastructure */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <Fuel className="text-gold" size={24} />
            ⛽ Gas Infrastructure (Arc & Circle)
          </h2>
          <div className="bg-card/50 border border-border rounded-lg p-6">
            <p className="text-muted-foreground mb-4">
              All contracts generated by ArcContractWiz are <span className="font-semibold text-gold">Gasless-Ready</span>.
            </p>
            
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-foreground mb-2">ERC-2771 — Meta-Transactions</h4>
                <ul className="text-muted-foreground space-y-1 ml-4">
                  <li>• Native support for sponsored transactions</li>
                  <li>• End users do not need to manage gas directly</li>
                </ul>
                <div className="mt-3 bg-background border border-border rounded-lg p-3">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">Trusted Forwarder (Arc):</span><br />
                    <code className="text-gold break-all">0x71bE63fcc4540BE48f49BA3371Ca0670355f3068</code>
                  </p>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Coins size={16} className="text-gold" />
                  Native USDC Gas
                </h4>
                <ul className="text-muted-foreground space-y-1 ml-4">
                  <li>• Arc uses USDC as the native gas currency</li>
                  <li>• Network fees are processed transparently</li>
                  <li>• Web2-friendly UX model</li>
                  <li>• Ideal for onboarding and frictionless testing</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Supported Network */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-foreground mb-4">Supported Network</h2>
          <div className="bg-gold/10 border border-gold/30 rounded-lg p-6">
            <p className="text-foreground font-semibold mb-2">Arc Testnet (Primary Focus)</p>
            <p className="text-sm text-muted-foreground">
              Note: The project is currently 100% focused on Arc Testnet.
              Support for additional testnets may be added in the future, respecting each network's native stablecoin.
            </p>
          </div>
        </section>

        {/* Technology Stack */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-foreground mb-4">Technology Stack</h2>
          <div className="flex flex-wrap gap-3">
            {[
              'Solidity (>= 0.8.x)',
              'OpenZeppelin Contracts',
              'ERC-721 / ERC-1155 / ERC-20 standards',
              'ERC-2771 (Gasless Transactions)',
              'USDC-compatible integrations',
              'Web-based wizard interface'
            ].map((tech, i) => (
              <span key={i} className="bg-card border border-border rounded-full px-4 py-2 text-sm text-muted-foreground">
                {tech}
              </span>
            ))}
          </div>
        </section>

        {/* Open Source */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <Github className="text-gold" size={24} />
            Open Source
          </h2>
          <div className="bg-card/50 border border-border rounded-lg p-6">
            <p className="text-muted-foreground mb-4">
              ArcContractWiz is fully open-source and publicly available on GitHub:
            </p>
            <a 
              href="https://github.com/6ktvp/arccontractwiz" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-gold hover:text-gold-light transition-colors"
            >
              <ExternalLink size={16} />
              https://github.com/6ktvp/arccontractwiz
            </a>
            <p className="text-muted-foreground mt-4">
              Contributions, issues, and feedback are welcome.
            </p>
          </div>
        </section>

        {/* Roadmap */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <Rocket className="text-gold" size={24} />
            Roadmap (Early)
          </h2>
          <ul className="space-y-3">
            {[
              'Continuous UX improvements for the wizard flow',
              'More detailed technical explanations per step',
              'Expanded validation and security checks',
              'Support for additional testnets',
              'ERC-20 contract evolution',
              'New experimental NFT standards'
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-muted-foreground">
                <span className="text-gold mt-1">→</span>
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* Who Is This For */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <Users className="text-gold" size={24} />
            Who Is This For?
          </h2>
          <ul className="space-y-3">
            {[
              'Developers onboarding to the Arc ecosystem',
              'Builders testing NFT and token ideas',
              'Early adopters of new blockchain networks',
              'Ecosystem teams seeking onboarding tools',
              'Solidity and Web3 learners',
              'Hackathons and experimental environments'
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-muted-foreground">
                <span className="text-gold mt-1">•</span>
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* Project Status */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-foreground mb-4">Project Status</h2>
          <div className="flex flex-wrap gap-3">
            <span className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-full px-4 py-2 text-sm font-medium">
              🟡 Early-stage
            </span>
            <span className="bg-green-500/20 text-green-400 border border-green-500/30 rounded-full px-4 py-2 text-sm font-medium">
              🟢 Actively developed
            </span>
            <span className="bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-full px-4 py-2 text-sm font-medium">
              🧪 Experimental and evolving
            </span>
          </div>
        </section>

        {/* Core Team */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <Users className="text-gold" size={24} />
            👥 Core Team & Maintainers
          </h2>
          <div className="bg-card/50 border border-border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-background/50">
                <tr>
                  <th className="text-left px-4 py-3 text-foreground font-semibold">Name</th>
                  <th className="text-left px-4 py-3 text-foreground font-semibold">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="px-4 py-3 text-muted-foreground">Rones Lira</td>
                  <td className="px-4 py-3 text-muted-foreground">Content Creator / Tester / Dev / Marketing</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-muted-foreground">Lucas</td>
                  <td className="px-4 py-3 text-muted-foreground">Content Creator / Tester / Dev / Marketing</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-muted-foreground">Alves</td>
                  <td className="px-4 py-3 text-muted-foreground">Contributor / Tester / Dev</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-muted-foreground">Júlio Cezar</td>
                  <td className="px-4 py-3 text-muted-foreground">Contributor / Tester / Dev</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-muted-foreground">Natan</td>
                  <td className="px-4 py-3 text-muted-foreground">Contributor / Tester</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-muted-foreground">Evaldo</td>
                  <td className="px-4 py-3 text-muted-foreground">Contributor / Tester</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Links */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-foreground mb-4">Links</h2>
          <div className="flex flex-col gap-3">
            <a 
              href="https://arccontractwiz.xyz" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-gold transition-colors"
            >
              <Globe size={16} />
              🌐 Website: https://arccontractwiz.xyz
            </a>
            <a 
              href="https://github.com/6ktvp/arccontractwiz" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-gold transition-colors"
            >
              <Github size={16} />
              💻 GitHub: https://github.com/6ktvp/arccontractwiz
            </a>
            <a 
              href="https://x.com/scontractWiz" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-gold transition-colors"
            >
              <Twitter size={16} />
              🐦 X (Twitter): @scontractWiz
            </a>
          </div>
        </section>

        {/* Disclaimer */}
        <section className="mb-12">
          <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
              <AlertTriangle className="text-destructive" size={20} />
              ⚠️ Disclaimer — Important Notice
            </h3>
            <p className="text-muted-foreground">
              This tool is provided "as-is" for experimental and educational purposes.
              Always carefully review, validate, and audit any generated contract before using it in production environments.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
