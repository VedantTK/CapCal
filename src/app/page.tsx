import CalculatorCard from '@/components/calculator-card';
import MainLayout from '@/components/layout/main-layout';
import { calculators } from '@/lib/calculators';
import { TrendingUp, Calculator, Shield, Zap, Target, DollarSign } from 'lucide-react';

export default function DashboardPage() {
  return (
    <MainLayout>
      <div className="space-y-12">
        {/* Hero Section with Wealth Focus */}
        <section className="text-center space-y-8 py-16">
          <div className="space-y-6">
            <div className="flex justify-center">
              <div className="wealth-pulse p-4 rounded-full bg-gradient-to-br from-emerald-500/20 to-amber-500/20">
                <TrendingUp className="h-12 w-12 wealth-text" />
              </div>
            </div>
            
            <h1 className="heading-primary">
              📈 Your Wealth Projection Hub
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Transform your financial future with professional-grade calculators. 
              <span className="wealth-text font-semibold">Boost your savings</span>, 
              track your <span className="opportunity-text font-semibold">golden opportunities</span>, 
              and watch your wealth grow with every calculation.
            </p>
          </div>
          
          {/* Wealth Score Teaser */}
          <div className="wealth-score-card max-w-md mx-auto">
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center gap-2">
                <Target className="h-5 w-5 wealth-text" />
                <span className="font-semibold text-foreground">Your Wealth Score</span>
              </div>
              <div className="wealth-progress">
                <div className="wealth-progress-fill" style={{ width: '75%' }}></div>
              </div>
              <p className="text-sm motivation-text">
                💡 Tip: Small changes = Big wealth over time
              </p>
            </div>
          </div>
          
          {/* Feature highlights with wealth theme */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-4xl mx-auto">
            <div className="wealth-card wealth-card-hover flex flex-col items-center space-y-4 p-6 rounded-xl">
              <div className="p-3 rounded-full bg-emerald-500/10">
                <Calculator className="h-6 w-6 wealth-text" />
              </div>
              <h3 className="font-semibold text-foreground">🚀 Boost Your Savings</h3>
              <p className="text-sm text-muted-foreground text-center">
                9+ professional calculators designed to maximize your wealth potential
              </p>
              <div className="growth-indicator">
                <TrendingUp className="h-3 w-3" />
                <span>Growth Focused</span>
              </div>
            </div>
            
            <div className="opportunity-card opportunity-card-hover flex flex-col items-center space-y-4 p-6 rounded-xl">
              <div className="p-3 rounded-full bg-amber-500/10">
                <DollarSign className="h-6 w-6 opportunity-text" />
              </div>
              <h3 className="font-semibold text-foreground">💰 Golden Opportunities</h3>
              <p className="text-sm text-muted-foreground text-center">
                Real-time analysis to identify and capitalize on wealth-building moments
              </p>
              <div className="opportunity-badge">
                <Zap className="h-3 w-3" />
                <span>Opportunity Alerts</span>
              </div>
            </div>
            
            <div className="finance-card card-hover flex flex-col items-center space-y-4 p-6 rounded-xl">
              <div className="p-3 rounded-full bg-primary/10">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">🛡️ Trusted & Secure</h3>
              <p className="text-sm text-muted-foreground text-center">
                Bank-grade security with multi-currency support for global investors
              </p>
              <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                <Shield className="h-3 w-3" />
                <span>Secure</span>
              </div>
            </div>
          </div>
        </section>

        {/* Calculators Section with Wealth Theme */}
        <section className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="heading-secondary wealth-heading">
              Start Growing Wealth Today
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Choose your path to financial growth. Each calculator is designed to help you make 
              <span className="wealth-text font-medium"> wealth-building decisions</span> with confidence.
            </p>
          </div>
          
          <div className="calculator-grid">
            {calculators.map((calculator) => (
              <CalculatorCard key={calculator.id} calculator={calculator} />
            ))}
          </div>
        </section>

        {/* Motivational CTA Section */}
        <section className="text-center py-16 px-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-amber-500/10 to-emerald-500/10 border border-emerald-200/50 dark:border-emerald-800/30">
          <div className="space-y-6">
            <div className="flex justify-center">
              <div className="wealth-pulse p-4 rounded-full bg-gradient-to-br from-emerald-500/20 to-amber-500/20">
                <Zap className="h-8 w-8 opportunity-text" />
              </div>
            </div>
            
            <h3 className="text-3xl font-bold text-foreground">
              🌟 Start Growing Wealth
            </h3>
            <p className="text-muted-foreground max-w-lg mx-auto text-lg">
              Join thousands of smart investors who use Global Invest Pro to 
              <span className="wealth-text font-semibold"> maximize their wealth potential</span>. 
              Every calculation brings you closer to financial freedom.
            </p>
            
            <div className="motivation-tip max-w-md mx-auto">
              <p className="text-sm motivation-text font-medium">
                💡 Success Tip: "The best time to plant a tree was 20 years ago. The second best time is now."
              </p>
            </div>
            
            <div className="flex justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <span>Free forever</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                <span>No registration</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                <span>Instant results</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}