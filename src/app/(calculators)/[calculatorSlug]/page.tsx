import { calculators } from '@/lib/calculators';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Shield, Info, TrendingUp, Target } from 'lucide-react';
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
        return <PlaceholderForm calculatorName={calculator.name} />;
    }
  };

  const Icon = calculator.icon;
  
  // Determine calculator theme
  const isWealthFocused = ['sip', 'step-up-sip', 'cagr', 'stock-profit-loss'].includes(calculator.slug);
  const isOpportunityFocused = ['stock-average', 'percentage', 'stock-split'].includes(calculator.slug);

  return (
    <div className="space-y-8">
      {/* Calculator Header with Wealth Theme */}
      <header className="text-center space-y-6 py-8">
        <div className="flex justify-center">
          <div className={`p-4 rounded-2xl border transition-all duration-300 ${
            isWealthFocused 
              ? 'bg-gradient-to-br from-emerald-500/10 to-emerald-500/20 border-emerald-200/50 dark:border-emerald-800/30' 
              : isOpportunityFocused
              ? 'bg-gradient-to-br from-amber-500/10 to-amber-500/20 border-amber-200/50 dark:border-amber-800/30'
              : 'bg-gradient-to-br from-primary/10 to-primary/20 border-primary/20'
          }`}>
            <Icon className={`h-12 w-12 ${calculator.color}`} />
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex justify-center">
            {isWealthFocused && (
              <div className="growth-indicator">
                <TrendingUp className="h-4 w-4" />
                <span>📈 Wealth Builder</span>
              </div>
            )}
            {isOpportunityFocused && (
              <div className="opportunity-badge">
                <Target className="h-4 w-4" />
                <span>💰 Smart Tool</span>
              </div>
            )}
          </div>
          
          <h1 className="heading-secondary">
            {calculator.name}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {calculator.description}
            {isWealthFocused && <span className="wealth-text font-medium"> Boost your wealth potential.</span>}
            {isOpportunityFocused && <span className="opportunity-text font-medium"> Discover golden opportunities.</span>}
          </p>
        </div>
        
        {/* Quick Stats with Wealth Theme */}
        <div className="flex justify-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <span>Real-time calculations</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-500"></div>
            <span>Multi-currency support</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary"></div>
            <span>Professional grade</span>
          </div>
        </div>
      </header>

      {/* Calculator Form */}
      <div className="max-w-4xl mx-auto">
        {renderCalculatorForm()}
      </div>

      {/* Wealth Tip Section */}
      {isWealthFocused && (
        <div className="max-w-4xl mx-auto">
          <div className="wealth-tip">
            <div className="flex items-start gap-3">
              <TrendingUp className="h-5 w-5 wealth-text flex-shrink-0 mt-0.5" />
              <div className="space-y-2">
                <p className="text-sm font-medium wealth-text">
                  💡 Wealth Building Tip
                </p>
                <p className="text-sm text-muted-foreground">
                  {calculator.slug === 'sip' && "Consistency is key! Even small monthly investments can grow into substantial wealth over time through the power of compounding."}
                  {calculator.slug === 'step-up-sip' && "Increase your SIP amount annually to accelerate wealth creation. A 10% yearly increase can significantly boost your final corpus."}
                  {calculator.slug === 'cagr' && "Focus on investments with consistent CAGR over 12-15% for long-term wealth building. Time in the market beats timing the market."}
                  {calculator.slug === 'stock-profit-loss' && "Track your wins and losses to improve your trading strategy. Successful wealth building requires learning from every trade."}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Disclaimer & Actions with Wealth Theme */}
      <Card className="finance-card max-w-4xl mx-auto">
        <CardHeader className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <Shield className="h-5 w-5 text-amber-600" />
            </div>
            <CardTitle className="text-lg">Important Disclaimer & Actions</CardTitle>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="motivation-tip">
            <div className="flex gap-3">
              <Info className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-2">
                <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                  🛡️ Investment Risk Notice
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                  All calculations are estimates intended for <span className="wealth-text font-medium">wealth-building guidance</span> only. 
                  Results may vary based on market conditions, fees, and other factors. 
                  Always consult with a qualified financial advisor before making investment decisions. 
                  <span className="motivation-text font-medium">Remember: Small changes = Big wealth over time.</span> 
                  Past performance does not guarantee future results. Market risks apply to all investments.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between pt-6 border-t border-border/50">
          <div className="flex gap-3">
            <Button variant="outline" disabled className="btn-secondary">
              <FileText className="mr-2 h-4 w-4" /> 
              Export to PDF
              <span className="ml-2 text-xs bg-muted px-2 py-0.5 rounded">Coming Soon</span>
            </Button>
          </div>
          
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <span>Wealth focused</span>
            </div>
            <span>Last updated: {new Date().toLocaleDateString()}</span>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}