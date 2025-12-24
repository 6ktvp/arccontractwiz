import { useState, useMemo } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { ContractTypeSelector } from './ContractTypeSelector';
import { ContractOptions } from './ContractOptions';
import { CodePreview } from './CodePreview';
import { ContractConfig, defaultConfig, ContractType } from '@/types/contract';
import { generateContract } from '@/utils/generateContract';
import { ChevronRight, Sparkles } from 'lucide-react';


type Step = 'type' | 'options' | 'preview';

export function ContractWizard() {
  const [step, setStep] = useState<Step>('type');
  const [config, setConfig] = useState<ContractConfig>(defaultConfig);

  const generatedCode = useMemo(() => generateContract(config), [config]);

  const handleConfigChange = (updates: Partial<ContractConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  };

  const handleTypeChange = (type: ContractType) => {
    setConfig((prev) => ({ ...prev, type }));
  };

  const steps = [
    { id: 'type', label: 'Token Type' },
    { id: 'options', label: 'Configuration' },
    { id: 'preview', label: 'Contract' },
  ];

  return (
    <div className="min-h-screen grid-background relative overflow-hidden">
      
      <div className="relative z-10 mx-auto max-w-4xl px-4 py-8">
        <Header />

        {/* Step Indicator */}
        <div className="mb-8 flex items-center justify-center gap-2">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center">
              <button
                onClick={() => setStep(s.id as Step)}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  step === s.id
                    ? 'bg-gold text-primary-foreground gold-glow'
                    : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                }`}
              >
                <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                  step === s.id ? 'bg-primary-foreground/20' : 'bg-muted'
                }`}>
                  {i + 1}
                </span>
                {s.label}
              </button>
              {i < steps.length - 1 && (
                <ChevronRight className="mx-2 h-4 w-4 text-muted-foreground" />
              )}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="rounded-xl border border-border bg-card p-6 gold-border-glow">
          {step === 'type' && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-foreground">Choose Token Standard</h2>
                <p className="mt-2 text-muted-foreground">
                  Select the type of smart contract you want to generate
                </p>
              </div>
              <ContractTypeSelector selected={config.type} onChange={handleTypeChange} />
              <div className="flex justify-center">
                <button
                  onClick={() => setStep('options')}
                  className="flex items-center gap-2 rounded-lg bg-gold px-6 py-3 font-medium text-primary-foreground transition-all hover:bg-gold-light gold-glow"
                >
                  Continue
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )}

          {step === 'options' && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-foreground">Configure Your {config.type}</h2>
                <p className="mt-2 text-muted-foreground">
                  Customize your contract features and settings
                </p>
              </div>
              <ContractOptions config={config} onChange={handleConfigChange} />
              <div className="flex justify-between">
                <button
                  onClick={() => setStep('type')}
                  className="rounded-lg border border-border bg-secondary px-6 py-3 font-medium text-foreground transition-all hover:bg-secondary/80"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep('preview')}
                  className="flex items-center gap-2 rounded-lg bg-gold px-6 py-3 font-medium text-primary-foreground transition-all hover:bg-gold-light gold-glow"
                >
                  <Sparkles size={20} />
                  Generate Contract
                </button>
              </div>
            </div>
          )}

          {step === 'preview' && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-foreground">Your {config.type} Contract</h2>
                <p className="mt-2 text-muted-foreground">
                  Copy, open in Remix, or download your contract
                </p>
              </div>
              <CodePreview code={generatedCode} contractName={config.name} config={config} />
              <div className="flex justify-start">
                <button
                  onClick={() => setStep('options')}
                  className="rounded-lg border border-border bg-secondary px-6 py-3 font-medium text-foreground transition-all hover:bg-secondary/80"
                >
                  Back to Edit
                </button>
              </div>
            </div>
          )}
        </div>

        <Footer />
      </div>
    </div>
  );
}
