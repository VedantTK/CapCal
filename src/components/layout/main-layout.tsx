import SiteHeader from '@/components/site-header';
import { TrendingUp, Shield, Globe, Target, Zap, DollarSign } from 'lucide-react';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-background via-background to-emerald-50/20 dark:to-emerald-950/10">
      <SiteHeader />
      
      <main className="flex-grow container mx-auto p-4 sm:p-6 md:p-8">
        <div className="fade-in">
          {children}
        </div>
      </main>
      
      <footer className="border-t border-border/50 bg-gradient-to-r from-muted/30 via-emerald-50/20 to-amber-50/20 dark:from-muted/30 dark:via-emerald-950/10 dark:to-amber-950/10">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Brand Section with Wealth Focus */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-emerald-500/20 to-amber-500/20">
                  <TrendingUp className="h-5 w-5 wealth-text" />
                </div>
                <span className="font-bold text-foreground">Global Invest Pro</span>
                <div className="growth-indicator">
                  <Target className="h-3 w-3" />
                  <span>Wealth Hub</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Professional wealth-building calculators for investors, traders, and financial planners. 
                <span className="wealth-text font-medium">Boost your savings</span> and discover 
                <span className="opportunity-text font-medium"> golden opportunities</span> worldwide.
              </p>
            </div>
            
            {/* Wealth Features */}
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground flex items-center gap-2">
                <Zap className="h-4 w-4 opportunity-text" />
                Wealth Features
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Shield className="h-3 w-3 wealth-text" />
                  <span>🛡️ Secure Wealth Calculations</span>
                </li>
                <li className="flex items-center gap-2">
                  <DollarSign className="h-3 w-3 opportunity-text" />
                  <span>💰 Multi-Currency Growth Tracking</span>
                </li>
                <li className="flex items-center gap-2">
                  <TrendingUp className="h-3 w-3 wealth-text" />
                  <span>📈 Real-time Wealth Projections</span>
                </li>
                <li className="flex items-center gap-2">
                  <Target className="h-3 w-3 opportunity-text" />
                  <span>🎯 Smart Investment Insights</span>
                </li>
              </ul>
            </div>
            
            {/* Wealth Disclaimer */}
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                Wealth Building Notice
              </h4>
              <div className="wealth-tip">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  💡 <span className="motivation-text font-medium">Success Tip:</span> All calculations are estimates for wealth-building guidance. 
                  Results may vary based on market conditions and personal financial decisions. 
                  Always consult with a qualified financial advisor for personalized wealth strategies. 
                  <span className="wealth-text font-medium">Small changes = Big wealth over time.</span>
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-border/50">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-muted-foreground text-center sm:text-left">
                © {new Date().getFullYear()} Global Invest Pro. All rights reserved. 
                <span className="mx-2">•</span>
                <span className="wealth-text font-medium">Building wealth worldwide</span>
              </p>
              
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <span>Wealth Focused</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                  <span>Opportunity Driven</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  <span>Trusted Platform</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}