"use client";

import { useCurrency, type CurrencyCode } from '@/contexts/currency-context';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DollarSign, TrendingUp } from 'lucide-react';

export function CurrencySelector() {
  const { currencyCode, setCurrencyCode, availableCurrencies, getCurrencyDisplayFormat } = useCurrency();

  const handleValueChange = (value: string) => {
    setCurrencyCode(value as CurrencyCode);
  };

  return (
    <div className="flex items-center gap-2">
      <div className="p-1.5 rounded-lg bg-primary-foreground/10">
        <DollarSign className="h-4 w-4 text-primary-foreground/80" />
      </div>
      <Select value={currencyCode} onValueChange={handleValueChange}>
        <SelectTrigger className="w-auto min-w-[130px] text-primary-foreground bg-primary-foreground/10 border-primary-foreground/20 hover:bg-primary-foreground/20 focus:ring-emerald-400/50 focus:border-emerald-400/50 transition-all duration-200">
          <SelectValue placeholder="Currency">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm">{currencyCode}</span>
              <TrendingUp className="h-3 w-3 text-emerald-400" />
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-popover text-popover-foreground border border-border/50 shadow-lg">
          {availableCurrencies.map((code) => (
            <SelectItem 
              key={code} 
              value={code} 
              className="cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-950/20 focus:bg-emerald-50 dark:focus:bg-emerald-950/20 transition-colors duration-200"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm font-medium">{code}</span>
                <span className="text-muted-foreground">•</span>
                <span className="text-sm">{getCurrencyDisplayFormat(code)}</span>
                {['USD', 'EUR', 'GBP'].includes(code) && (
                  <div className="opportunity-badge">
                    <span>Popular</span>
                  </div>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}