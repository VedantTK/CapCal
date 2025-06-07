import { calculators } from '@/lib/calculators';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, BarChart2 } from 'lucide-react';
// Removed AiChartSuggesterForm import
import StockAverageForm from '@/components/calculators/stock-average-form';
import StockProfitLossForm from '@/components/calculators/stock-profit-loss-form';
import SipCalculatorForm from '@/components/calculators/sip-calculator-form';
import PercentageCalculatorForm from '@/components/calculators/percentage-calculator-form';
import EmiCalculatorForm from '@/components/calculators/emi-calculator-form';
import CagrCalculatorForm from '@/components/calculators/cagr-calculator-form';
import SwpCalculatorForm from '@/components/calculators/swp-calculator-form';
import StockSplitCalculatorForm from '@/components/calculators/stock-split-calculator-form';


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
        return <StockAverageForm />;
      case 'stock-profit-loss':
        return <StockProfitLossForm />;
      case 'sip':
        return <SipCalculatorForm />;
      case 'percentage':
        return <PercentageCalculatorForm />;
      case 'emi':
        return <EmiCalculatorForm />;
      case 'cagr':
        return <CagrCalculatorForm />;
      case 'swp':
        return <SwpCalculatorForm />;
      case 'stock-split':
        return <StockSplitCalculatorForm />;
      // Removed 'ai-chart-suggestion' case
      default:
        return <p className="text-muted-foreground">Calculator form coming soon for {calculator.name}.</p>;
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl font-headline">{calculator.name}</h1>
        <p className="mt-2 text-lg text-muted-foreground">{calculator.description}</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Input Parameters</CardTitle>
          <CardDescription>Enter the required values for the calculation.</CardDescription>
        </CardHeader>
        <CardContent>
          {renderCalculatorForm()}
        </CardContent>
      </Card>

      {/* Results and Visualization cards are now always shown */}
      <Card>
       <CardHeader>
         <CardTitle>Results</CardTitle>
         <CardDescription>View your calculation results below.</CardDescription>
       </CardHeader>
       <CardContent>
         <p className="text-muted-foreground">Calculation results will appear here.</p>
         {/* Placeholder for results display */}
       </CardContent>
       <CardFooter className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
          <div>
              <p className="text-xs text-muted-foreground">Disclaimer: Calculations are estimates and subject to market risks.</p>
          </div>
          <div className="flex gap-2">
              <Button variant="outline">
              <FileText className="mr-2 h-4 w-4" /> Export to PDF
              </Button>
          </div>
       </CardFooter>
     </Card>

      <Card>
        <CardHeader>
          <CardTitle>Visualizations</CardTitle>
          <CardDescription>Interactive chart based on your calculation.</CardDescription>
        </CardHeader>
        <CardContent className="min-h-[200px] flex items-center justify-center bg-muted/50 rounded-md">
          <div className="text-center text-muted-foreground">
            <BarChart2 className="mx-auto h-12 w-12 mb-2" />
            <p>Chart visualization will appear here.</p>
          </div>
          {/* Placeholder for chart */}
        </CardContent>
      </Card>
    </div>
  );
}
