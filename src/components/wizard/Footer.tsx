import { Github, FileText } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-12 border-t border-border py-8">
      <div className="flex flex-col items-center gap-4">
        <p className="text-sm text-muted-foreground">
          © <span className="font-semibold text-foreground">ArcContractWiz</span> 2025 — Open-source smart contract wizard for Arc
        </p>
        <div className="flex items-center gap-6">
          <a 
            href="https://x.com/scontractWiz" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-gold transition-colors"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            X (Twitter)
          </a>
          <a 
            href="https://github.com/6ktvp/arccontractwiz" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-gold transition-colors"
          >
            <Github size={16} />
            GitHub
          </a>
          <a 
            href="/docs" 
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-gold transition-colors"
          >
            <FileText size={16} />
            Docs
          </a>
        </div>
      </div>
    </footer>
  );
}
