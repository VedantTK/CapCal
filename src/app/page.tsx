import CalculatorCard from '@/components/calculator-card';
import MainLayout from '@/components/layout/main-layout';
import { calculators } from '@/lib/calculators';
import { TrendingUp, Calculator, Shield, Zap, Target, DollarSign, Sparkles, Star } from 'lucide-react';

export default function DashboardPage() {
  return (
    <MainLayout>
      <div className="space-y-16">
        {/* Hero Section with Enhanced Wealth Focus */}
        <section className="text-center space-y-12 py-20">
          <div className="space-y-8">
            <div className="flex justify-center">
              <div className="relative">
                <div className="wealth-pulse p-6 rounded-full bg-gradient-to-br from-emerald-500/20 to-amber-500/20 shadow-lg">
                  <TrendingUp className="h-16 w-16 wealth-text" />
                </div>
                <div className="absolute -top-2 -right-2">
                  <Sparkles className="h-8 w-8 text-amber-400 animate-pulse" />
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <h1 className="heading-primary">
                📈 Your Wealth Projection Hub
              </h1>
              <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
                Transform your financial future with professional-grade calculators. 
                <span className="wealth-text font-bold">Boost your savings</span>, 
                track your <span className="opportunity-text font-bold">golden opportunities</span>, 
                and watch your wealth grow with every calculation.
              </p>
            </div>
          </div>
          
          {/* Enhanced Wealth Score Teaser */}
          <div className="wealth-card max-w-lg mx-auto p-8">
            <div className="text-center space-y-6">
              <div className="flex items-center justify-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10">
                  <Target className="h-6 w-6 wealth-text" />
                </div>
                <span className="text-xl font-bold text-foreground">Your Wealth Score</span>
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <Star className="h-6 w-6 opportunity-text" />
                </div>
              </div>
              
              <div className="relative">
                <div className="wealth-progress h-4 rounded-full">
                  <div className="wealth-progress-fill rounded-full" style={{ width: '75%' }}></div>
                </div>
                <div className="absolute -top-1 left-3/4 transform -translate-x-1/2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-emerald-500 to-amber-500 border-2 border-white shadow-lg"></div>
                </div>
              </div>
              
              <div className="motivation-tip">
                <p className="text-sm motivation-text font-semibold">
                  💡 Success Tip: Small changes = Big wealth over time
                </p>
              </div>
            </div>
          </div>
          
          {/* Enhanced Feature highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-6xl mx-auto">
            <div className="wealth-card p-8 text-center space-y-6">
              <div className="flex justify-center">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/15 to-emerald-600/25">
                  <Calculator className="h-8 w-8 wealth-text" />
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-foreground">🚀 Boost Your Savings</h3>
                <p className="text-muted-foreground leading-relaxed">
                  9+ professional calculators designed to maximize your wealth potential with real-time projections
                </p>
              </div>
              <div className="growth-indicator">
                <TrendingUp className="h-4 w-4" />
                <span>Growth Focused</span>
              </div>
            </div>
            
            <div className="opportunity-card p-8 text-center space-y-6">
              <div className="flex justify-center">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/15 to-amber-600/25">
                  <DollarSign className="h-8 w-8 opportunity-text" />
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-foreground">💰 Golden Opportunities</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Real-time analysis with AMFI data integration to identify and capitalize on wealth-building moments
                </p>
              </div>
              <div className="opportunity-badge">
                <Zap className="h-4 w-4" />
                <span>Smart Analytics</span>
              </div>
            </div>
            
            <div className="premium-card p-8 text-center space-y-6">
              <div className="flex justify-center">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/25">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-foreground">🛡️ Trusted & Secure</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Bank-grade security with multi-currency support and professional-grade calculations
                </p>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium bg-primary/10 text-primary border border-primary/20">
                <Shield className="h-4 w-4" />
                <span>Enterprise Grade</span>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Calculators Section */}
        <section className="space-y-12">
          <div className="text-center space-y-6">
            <h2 className="heading-secondary wealth-heading">
              Start Growing Wealth Today
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Choose your path to financial growth. Each calculator is designed to help you make 
              <span className="wealth-text font-bold"> wealth-building decisions</span> with confidence and precision.
            </p>
          </div>
          
          <div className="calculator-grid">
            {calculators.map((calculator) => (
              <CalculatorCard key={calculator.id} calculator={calculator} />
            ))}
          </div>
        </section>

        {/* Enhanced Motivational CTA Section */}
        <section className="relative overflow-hidden">
          <div className="wealth-card p-12 text-center space-y-8">
            <div className="space-y-8">
              <div className="flex justify-center">
                <div className="relative">
                  <div className="wealth-pulse p-6 rounded-full bg-gradient-to-br from-emerald-500/20 to-amber-500/20">
                    <Zap className="h-12 w-12 opportunity-text" />
                  </div>
                  <div className="absolute -top-1 -right-1">
                    <Star className="h-6 w-6 text-amber-400 animate-pulse" />
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-4xl font-bold text-foreground">
                  🌟 Start Growing Wealth
                </h3>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                  Join thousands of smart investors who use Global Invest Pro to 
                  <span className="wealth-text font-bold"> maximize their wealth potential</span>. 
                  Every calculation brings you closer to financial freedom.
                </p>
              </div>
              
              <div className="motivation-tip max-w-xl mx-auto">
                <div className="flex items-center gap-3 justify-center">
                  <Sparkles className="h-5 w-5 motivation-text" />
                  <p className="text-base motivation-text font-bold">
                    "The best time to plant a tree was 20 years ago. The second best time is now."
                  </p>
                  <Sparkles className="h-5 w-5 motivation-text" />
                </div>
              </div>
              
              <div className="flex justify-center gap-8 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm"></div>
                  <span className="font-medium">Free forever</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500 shadow-sm"></div>
                  <span className="font-medium">No registration</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary shadow-sm"></div>
                  <span className="font-medium">Instant results</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}