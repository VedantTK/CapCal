
"use client";

import { useCurrency, type CurrencyCode } from '@/contexts/currency-context';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function CurrencySelector() {
  const { currencyCode, setCurrencyCode, availableCurrencies, getCurrencyDisplayFormat } = useCurrency();

  const handleValueChange = (value: string) => {
    setCurrencyCode(value as CurrencyCode);
  };

  return (
    <Select value={currencyCode} onValueChange={handleValueChange}>
      <SelectTrigger className="w-auto min-w-[100px] text-primary-foreground bg-primary border-primary-foreground/50 hover:bg-primary/90 focus:ring-primary-foreground">
        <SelectValue placeholder="Currency">
          {getCurrencyDisplayFormat(currencyCode)}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="bg-popover text-popover-foreground">
        {availableCurrencies.map((code) => (
          <SelectItem key={code} value={code} className="cursor-pointer hover:bg-accent focus:bg-accent">
            {getCurrencyDisplayFormat(code)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
