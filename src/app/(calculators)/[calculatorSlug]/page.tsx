
import { calculators } from '@/lib/calculators';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
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


export async function generateStaticParams() {
  return calculators.map((calc) => ({
    calculatorSlug: calc.slug,
  }));
}

export default function CalculatorPage({ params }: { params: { calculatorSlug: string } }) {
  const calculator = calculators.find(c => c.slug === params.calculatorSlug);

  if (!calculator) {
    notFound();
  }

  const renderCalculatorForm = () => {
    switch (params.calculatorSlug) {
      case 'stock-average':
        return <StockAverageForm calculatorName={calculator.name} />;
      case 'stock-profit-loss':
        return <StockProfitLossForm calculatorName={calculator.name} />;
      case 'sip':
        return <SipCalculatorForm calculatorName={calculator.name} />;
      case 'step-up-sip':
        return <StepUpSipCalculatorForm calculatorName={calculator.name} />;
      case 'percentage':
        return <PercentageCalculatorForm calculatorName={calculator.name} />;
      case 'emi':
        return <EmiCalculatorForm calculatorName={calculator.name} />;
      case 'cagr':
        return <CagrCalculatorForm calculatorName={calculator.name} />;
      case 'swp':
        return <SwpCalculatorForm calculatorName={calculator.name} />;
      case 'stock-split':
        return <StockSplitCalculatorForm calculatorName={calculator.name} />;
      default:
        // This case might be hit if a new calculator is added to calculators.ts 
        // but not to this switch statement, or for calculators still using PlaceholderForm.
        return <PlaceholderForm calculatorName={calculator.name} />;
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl font-headline">{calculator.name}</h1>
        <p className="mt-2 text-lg text-muted-foreground">{calculator.description}</p>
      </header>

      {renderCalculatorForm()}

      <Card>
       <CardHeader>
         <CardTitle>Disclaimer &amp; Actions</CardTitle>
       </CardHeader>
       <CardContent>
          <p className="text-xs text-muted-foreground">Disclaimer: Calculations are estimates and intended for informational purposes only. Always consult with a financial advisor before making investment decisions. Market risks apply.</p>
       </CardContent>
       <CardFooter className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
          <div className="flex gap-2">
              <Button variant="outline" disabled>
              <FileText className="mr-2 h-4 w-4" /> Export to PDF (Coming Soon)
              </Button>
          </div>
       </CardFooter>
     </Card>
    </div>
  );
}
