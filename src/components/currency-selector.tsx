"use client";

import { useCurrency, type CurrencyCode } from '@/contexts/currency-context';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DollarSign } from 'lucide-react';

export function CurrencySelector() {
  const { currencyCode, setCurrencyCode, availableCurrencies, getCurrencyDisplayFormat } = useCurrency();

  const handleValueChange = (value: string) => {
    setCurrencyCode(value as CurrencyCode);
  };

  return (
    <div className="flex items-center gap-2">
      <DollarSign className="h-4 w-4 text-primary-foreground/80" />
      <Select value={currencyCode} onValueChange={handleValueChange}>
        <SelectTrigger className="w-auto min-w-[120px] text-primary-foreground bg-primary-foreground/10 border-primary-foreground/20 hover:bg-primary-foreground/20 focus:ring-primary-foreground/50 focus:border-primary-foreground/50">
          <SelectValue placeholder="Currency">
            {getCurrencyDisplayFormat(currencyCode)}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-popover text-popover-foreground border border-border/50 shadow-lg">
          {availableCurrencies.map((code) => (
            <SelectItem 
              key={code} 
              value={code} 
              className="cursor-pointer hover:bg-accent/10 focus:bg-accent/10 transition-colors duration-200"
            >
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm">{code}</span>
                <span className="text-muted-foreground">•</span>
                <span className="text-sm">{getCurrencyDisplayFormat(code)}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}