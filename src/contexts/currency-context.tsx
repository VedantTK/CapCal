"use client";

import type { Dispatch, SetStateAction } from 'react';
import React, { createContext, useContext, useState, useMemo } from 'react';

export type Currency = 'USD' | 'EUR' | 'INR' | 'GBP';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: Dispatch<SetStateAction<Currency>>;
  currencies: Currency[];
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState<Currency>('USD');
  const currencies: Currency[] = useMemo(() => ['USD', 'EUR', 'INR', 'GBP'], []);

  const value = useMemo(() => ({ currency, setCurrency, currencies }), [currency, currencies]);

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
