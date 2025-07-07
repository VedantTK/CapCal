import { calculators } from '@/lib/calculators';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Shield, Info } from 'lucide-react';
import StockAverageForm from '@/components/calculators/stock-average-form';
import StockProfitLossForm from '@/components/calculators/stock-profit-loss-form';
import EnhancedSipCalculatorForm from '@/components/calculators/enhanced-sip-calculator-form';
import PercentageCalculatorForm from '@/components/calculators/percentage-calculator-form';
import EmiCalculatorForm from '@/components/calculators/emi-calculator-form';
import CagrCalculatorForm from '@/components/calculators/cagr-calculator-form';
import EnhancedSwpCalculatorForm from '@/components/calculators/enhanced-swp-calculator-form';
import StockSplitCalculatorForm from '@/components/calculators/stock-split-calculator-form';
import EnhancedStepUpSipCalculatorForm from '@/components/calculators/enhanced-step-up-sip-calculator-form';
import PlaceholderForm from '@/components/calculators/placeholder-form';

export async function generateStaticParams() {
  return calculators.map((calc) => ({
    calculatorSlug: calc.slug,
  }));
}

export default async function CalculatorPage({ params }: { params: Promise<{ calculatorSlug: string }> }) {
  const { calculatorSlug } = await params;
  const calculator = calculators.find(c => c.slug === calculatorSlug);

  if (!calculator) {
    notFound();
  }

  const renderCalculatorForm = () => {
    switch (calculatorSlug) {
      case 'stock-average':
        return <StockAverageForm calculatorName={calculator.name} />;
      case 'stock-profit-loss':
        return <StockProfitLossForm calculatorName={calculator.name} />;
      case 'sip':
        return <EnhancedSipCalculatorForm calculatorName={calculator.name} />;
      case 'step-up-sip':
        return <EnhancedStepUpSipCalculatorForm calculatorName={calculator.name} />;
      case 'percentage':
        return <PercentageCalculatorForm calculatorName={calculator.name} />;
      case 'emi':
        return <EmiCalculatorForm calculatorName={calculator.name} />;
      case 'cagr':
        return <CagrCalculatorForm calculatorName={calculator.name} />;
      case 'swp':
        return <EnhancedSwpCalculatorForm calculatorName={calculator.name} />;
      case 'stock-split':
        return <StockSplitCalculatorForm calculatorName={calculator.name} />;
      default:
        return <PlaceholderForm calculatorName={calculator.name} />;
    }
  };

  const Icon = calculator.icon;

  return (
    <div className="container-simple">
      <div className="section-simple space-loose">
        {/* Calculator Header */}
        <div className="text-center space-tight">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6">
            <Icon className={`h-8 w-8 ${calculator.color || 'text-primary'}`} />
          </div>
          
          <h1 className="text-heading">{calculator.name}</h1>
          <p className="text-large max-w-2xl mx-auto">{calculator.description}</p>
        </div>

        {/* Calculator Form */}
        <div className="max-w-4xl mx-auto">
          {renderCalculatorForm()}
        </div>

        {/* Disclaimer */}
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-warning" />
              Important Disclaimer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-tight">
            <div className="flex gap-3">
              <Info className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-small leading-relaxed">
                  All calculations are estimates for guidance only. Results may vary based on market conditions, 
                  fees, and other factors. Always consult with a qualified financial advisor before making 
                  investment decisions. Past performance does not guarantee future results.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <Button variant="outline" disabled>
                <FileText className="mr-2 h-4 w-4" /> 
                Export PDF (Coming Soon)
              </Button>
              <span className="text-xs text-muted-foreground">
                Last updated: {new Date().toLocaleDateString()}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}