
"use client";

import type { Dispatch, SetStateAction } from 'react';
import React, { createContext, useContext, useState, useMemo } from 'react';

export type CurrencyCode = 
  | 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CNY' 
  | 'INR' | 'CHF' | 'RUB' | 'CAD' | 'AUD' | 'SGD';

export const CURRENCY_SYMBOLS: Readonly<Record<CurrencyCode, string>> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  CNY: '¥',
  INR: '₹',
  CHF: '₣',
  RUB: '₽',
  CAD: 'C$',
  AUD: 'A$',
  SGD: 'S$',
};

export const AVAILABLE_CURRENCIES: ReadonlyArray<CurrencyCode> = [
  'USD', 'EUR', 'GBP', 'JPY', 'CNY', 
  'INR', 'CHF', 'RUB', 'CAD', 'AUD', 'SGD',
];

interface CurrencyContextType {
  currencyCode: CurrencyCode;
  setCurrencyCode: Dispatch<SetStateAction<CurrencyCode>>;
  availableCurrencies: ReadonlyArray<CurrencyCode>;
  selectedCurrencySymbol: string;
  getCurrencyDisplayFormat: (code: CurrencyCode) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currencyCode, setCurrencyCode] = useState<CurrencyCode>('USD');

  const selectedCurrencySymbol = useMemo(() => CURRENCY_SYMBOLS[currencyCode], [currencyCode]);

  const getCurrencyDisplayFormat = (code: CurrencyCode): string => {
    return `${CURRENCY_SYMBOLS[code]} (${code})`;
  };
  
  const value = useMemo(() => ({ 
    currencyCode, 
    setCurrencyCode, 
    availableCurrencies: AVAILABLE_CURRENCIES,
    selectedCurrencySymbol,
    getCurrencyDisplayFormat
  }), [currencyCode, selectedCurrencySymbol]);

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
