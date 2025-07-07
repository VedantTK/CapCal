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
    <div className="flex items-center space-x-2">
      <DollarSign className="h-4 w-4 text-muted-foreground" />
      <Select value={currencyCode} onValueChange={handleValueChange}>
        <SelectTrigger className="w-24 h-9 text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {availableCurrencies.map((code) => (
            <SelectItem key={code} value={code}>
              {code}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}