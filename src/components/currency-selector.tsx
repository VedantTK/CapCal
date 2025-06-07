"use client";

import { useCurrency, type Currency } from '@/contexts/currency-context';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function CurrencySelector() {
  const { currency, setCurrency, currencies } = useCurrency();

  const handleValueChange = (value: string) => {
    setCurrency(value as Currency);
  };

  return (
    <Select value={currency} onValueChange={handleValueChange}>
      <SelectTrigger className="w-[100px] text-primary-foreground bg-primary border-primary-foreground/50 hover:bg-primary/90 focus:ring-primary-foreground">
        <SelectValue placeholder="Currency" />
      </SelectTrigger>
      <SelectContent className="bg-popover text-popover-foreground">
        {currencies.map((curr) => (
          <SelectItem key={curr} value={curr} className="cursor-pointer hover:bg-accent focus:bg-accent">
            {curr}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
