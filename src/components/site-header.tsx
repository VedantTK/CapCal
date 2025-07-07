import Link from 'next/link';
import { CurrencySelector } from '@/components/currency-selector';
import { Calculator } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

export default function SiteHeader() {
  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container-simple flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-3" prefetch={false}>
          <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-md">
            <Calculator className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold">Financial Calculator</span>
        </Link>
        
        <div className="flex items-center space-x-4">
          <CurrencySelector />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}