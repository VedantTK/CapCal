import Link from 'next/link';
import { CurrencySelector } from '@/components/currency-selector';
import { MountainIcon } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

export default function SiteHeader() {
  return (
    <header className="bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2" prefetch={false}>
          <MountainIcon className="h-6 w-6" />
          <span className="text-lg font-semibold font-headline">CapReckon</span>
        </Link>
        <div className="flex items-center gap-2">
          <CurrencySelector />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
