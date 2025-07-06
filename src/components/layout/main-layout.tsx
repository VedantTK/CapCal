import SiteHeader from '@/components/site-header';
import { TrendingUp, Shield, Globe } from 'lucide-react';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <SiteHeader />
      
      <main className="flex-grow container mx-auto p-4 sm:p-6 md:p-8">
        <div className="fade-in">
          {children}
        </div>
      </main>
      
      <footer className="border-t border-border/50 bg-gradient-to-r from-muted/30 to-muted/50">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Brand Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <span className="font-bold text-foreground">Global Invest Pro</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Professional financial calculators for investors, traders, and financial planners worldwide.
              </p>
            </div>
            
            {/* Features */}
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Features</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Shield className="h-3 w-3 text-accent" />
                  <span>Secure Calculations</span>
                </li>
                <li className="flex items-center gap-2">
                  <Globe className="h-3 w-3 text-accent" />
                  <span>Multi-Currency Support</span>
                </li>
                <li className="flex items-center gap-2">
                  <TrendingUp className="h-3 w-3 text-accent" />
                  <span>Real-time Results</span>
                </li>
              </ul>
            </div>
            
            {/* Disclaimer */}
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Important Notice</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                All calculations are estimates for informational purposes only. 
                Always consult with a qualified financial advisor before making investment decisions. 
                Market risks apply to all investments.
              </p>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-border/50 text-center">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} Global Invest Pro. All rights reserved. 
              <span className="mx-2">•</span>
              Built for financial professionals worldwide.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}