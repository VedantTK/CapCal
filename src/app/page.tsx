import CalculatorCard from '@/components/calculator-card';
import MainLayout from '@/components/layout/main-layout';
import { calculators } from '@/lib/calculators';
import { TrendingUp, Calculator, Shield, Zap } from 'lucide-react';

export default function DashboardPage() {
  return (
    <MainLayout>
      <div className="space-y-12">
        {/* Hero Section */}
        <section className="text-center space-y-6 py-12">
          <div className="space-y-4">
            <h1 className="heading-primary">
              Global Invest Pro
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Your comprehensive financial calculation platform. Make informed investment decisions with our 
              suite of professional-grade calculators, featuring real-time currency conversion and advanced analytics.
            </p>
          </div>
          
          {/* Feature highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-4xl mx-auto">
            <div className="flex flex-col items-center space-y-3 p-6 rounded-lg bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/20">
              <div className="p-3 rounded-full bg-primary/10">
                <Calculator className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">9+ Calculators</h3>
              <p className="text-sm text-muted-foreground text-center">
                Comprehensive suite of financial tools for all your investment needs
              </p>
            </div>
            
            <div className="flex flex-col items-center space-y-3 p-6 rounded-lg bg-gradient-to-br from-accent/5 to-primary/5 border border-accent/20">
              <div className="p-3 rounded-full bg-accent/10">
                <TrendingUp className="h-6 w-6 text-accent" />
              </div>
              <h3 className="font-semibold text-foreground">Real-time Analysis</h3>
              <p className="text-sm text-muted-foreground text-center">
                Instant calculations with visual feedback and detailed projections
              </p>
            </div>
            
            <div className="flex flex-col items-center space-y-3 p-6 rounded-lg bg-gradient-to-br from-blue-500/5 to-purple-500/5 border border-blue-500/20">
              <div className="p-3 rounded-full bg-blue-500/10">
                <Shield className="h-6 w-6 text-blue-500" />
              </div>
              <h3 className="font-semibold text-foreground">Multi-Currency</h3>
              <p className="text-sm text-muted-foreground text-center">
                Support for 11+ global currencies with automatic conversion
              </p>
            </div>
          </div>
        </section>

        {/* Calculators Section */}
        <section className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="heading-secondary">
              Financial Calculators & Tools
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Choose from our collection of specialized calculators designed for investors, 
              traders, and financial planners.
            </p>
          </div>
          
          <div className="calculator-grid">
            {calculators.map((calculator) => (
              <CalculatorCard key={calculator.id} calculator={calculator} />
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center py-12 px-6 rounded-2xl bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border border-primary/20">
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="p-4 rounded-full bg-primary/10">
                <Zap className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-foreground">
              Start Calculating Today
            </h3>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Join thousands of investors who trust Global Invest Pro for their financial calculations.
              All tools are free to use with no registration required.
            </p>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}