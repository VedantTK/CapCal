import Link from 'next/link';
import { CurrencySelector } from '@/components/currency-selector';
import { TrendingUp, BarChart3, Target } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

export default function SiteHeader() {
  return (
    <header className="bg-gradient-to-r from-primary via-primary to-primary/95 text-primary-foreground shadow-lg border-b border-primary/20">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-3 group" prefetch={false}>
          <div className="relative">
            <div className="p-2 rounded-lg bg-primary-foreground/10 group-hover:bg-primary-foreground/20 transition-colors duration-300">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></div>
          </div>
          <div className="space-y-0.5">
            <span className="text-lg font-bold font-headline tracking-tight">Global Invest Pro</span>
            <div className="flex items-center gap-2 text-xs text-primary-foreground/80">
              <Target className="h-3 w-3" />
              <span>Wealth Building Hub</span>
              <div className="w-1 h-1 rounded-full bg-emerald-400"></div>
              <span>Live</span>
            </div>
          </div>
        </Link>
        
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary-foreground/10 text-xs font-medium">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
            <span>📈 Wealth Tracking</span>
          </div>
          <CurrencySelector />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}