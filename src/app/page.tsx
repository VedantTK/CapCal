import CalculatorCard from '@/components/calculator-card';
import MainLayout from '@/components/layout/main-layout';
import { calculators } from '@/lib/calculators';
import { Calculator, TrendingUp } from 'lucide-react';

export default function DashboardPage() {
  return (
    <MainLayout>
      <div className="container-simple">
        {/* Hero Section */}
        <section className="section-simple text-center">
          <div className="space-loose">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6">
              <Calculator className="w-8 h-8 text-primary" />
            </div>
            
            <h1 className="text-heading">
              Financial Calculator
            </h1>
            
            <p className="text-large max-w-2xl mx-auto">
              Professional financial calculators to help you make informed investment decisions. 
              Calculate returns, plan investments, and track your financial goals.
            </p>
          </div>
        </section>

        {/* Calculators Grid */}
        <section className="pb-20">
          <div className="text-center mb-12">
            <h2 className="text-subheading mb-4">Choose a Calculator</h2>
            <p className="text-large">Select from our collection of financial tools</p>
          </div>
          
          <div className="grid-4">
            {calculators.map((calculator) => (
              <CalculatorCard key={calculator.id} calculator={calculator} />
            ))}
          </div>
        </section>

        {/* Simple CTA */}
        <section className="text-center py-16 bg-muted/30 rounded-lg">
          <div className="space-tight">
            <TrendingUp className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-subheading">Start Calculating</h3>
            <p className="text-large max-w-lg mx-auto">
              Use our calculators to plan your financial future and make better investment decisions.
            </p>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}