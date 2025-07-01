
"use client";

import { useState, useCallback } from 'react';
import { calculators } from '@/lib/calculators';
import { notFound, useParams } from 'next/navigation';
import StockAverageForm from '@/components/calculators/stock-average-form';
import StockProfitLossForm from '@/components/calculators/stock-profit-loss-form';
import SipCalculatorForm from '@/components/calculators/sip-calculator-form';
import PercentageCalculatorForm from '@/components/calculators/percentage-calculator-form';
import EmiCalculatorForm from '@/components/calculators/emi-calculator-form';
import CagrCalculatorForm from '@/components/calculators/cagr-calculator-form';
import SwpCalculatorForm from '@/components/calculators/swp-calculator-form';
import StockSplitCalculatorForm from '@/components/calculators/stock-split-calculator-form';
import StepUpSipCalculatorForm from '@/components/calculators/step-up-sip-calculator-form';
import PlaceholderForm from '@/components/calculators/placeholder-form';
import CalculatorShell from '@/components/calculator-shell';

// Note: This page is a client component because it needs to manage state
// between the calculator form and the calculator shell (for exporting results).

export default function CalculatorPage() {
  const params = useParams<{ calculatorSlug: string }>();
  const [resultData, setResultData] = useState<Record<string, any> | null>(null);

  // We can't use generateStaticParams in a client component directly, 
  // but Next.js will still pre-render these pages at build time if the data is available.
  // For a fully static export, this page structure would need adjustment, 
  // but it works perfectly in a dynamic Next.js app.
  const calculator = calculators.find(c => c.slug === params.calculatorSlug);

  if (!calculator) {
    notFound();
  }
  
  const handleResultUpdate = useCallback((data: Record<string, any> | null) => {
    setResultData(data);
  }, []);

  const renderCalculatorForm = () => {
    switch (params.calculatorSlug) {
      case 'stock-average':
        return <StockAverageForm calculatorName={calculator.name} onResultUpdate={handleResultUpdate} />;
      case 'stock-profit-loss':
        return <StockProfitLossForm calculatorName={calculator.name} onResultUpdate={handleResultUpdate} />;
      case 'sip':
        return <SipCalculatorForm calculatorName={calculator.name} onResultUpdate={handleResultUpdate} />;
      case 'step-up-sip':
        return <StepUpSipCalculatorForm calculatorName={calculator.name} onResultUpdate={handleResultUpdate} />;
      case 'percentage':
        return <PercentageCalculatorForm calculatorName={calculator.name} onResultUpdate={handleResultUpdate} />;
      case 'emi':
        return <EmiCalculatorForm calculatorName={calculator.name} onResultUpdate={handleResultUpdate} />;
      case 'cagr':
        return <CagrCalculatorForm calculatorName={calculator.name} onResultUpdate={handleResultUpdate} />;
      case 'swp':
        return <SwpCalculatorForm calculatorName={calculator.name} onResultUpdate={handleResultUpdate} />;
      case 'stock-split':
        return <StockSplitCalculatorForm calculatorName={calculator.name} onResultUpdate={handleResultUpdate} />;
      default:
        return <PlaceholderForm calculatorName={calculator.name} />;
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl font-headline">{calculator.name}</h1>
        <p className="mt-2 text-lg text-muted-foreground">{calculator.description}</p>
      </header>

      <div className="space-y-4">
        {renderCalculatorForm()}
      
        <CalculatorShell calculatorSlug={calculator.slug} resultData={resultData}>
          <p className="text-xs text-muted-foreground">
            Disclaimer: Calculations are estimates and intended for informational purposes only. Always consult with a financial advisor before making investment decisions. Market risks apply.
          </p>
        </CalculatorShell>
      </div>
    </div>
  );
}
