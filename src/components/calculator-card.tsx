import Link from 'next/link';
import type { CalculatorInfo } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ArrowRight, TrendingUp, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CalculatorCardProps {
  calculator: CalculatorInfo;
}

export default function CalculatorCard({ calculator }: CalculatorCardProps) {
  const Icon = calculator.icon;
  
  // Determine card theme based on calculator type
  const isWealthFocused = ['sip', 'step-up-sip', 'cagr', 'stock-profit-loss'].includes(calculator.slug);
  const isOpportunityFocused = ['stock-average', 'percentage', 'stock-split'].includes(calculator.slug);
  
  const cardClasses = cn(
    "h-full card-hover group-hover:shadow-xl transition-all duration-300",
    isWealthFocused && "wealth-card wealth-card-hover",
    isOpportunityFocused && "opportunity-card opportunity-card-hover",
    !isWealthFocused && !isOpportunityFocused && "finance-card group-hover:border-primary/40"
  );
  
  return (
    <Link href={calculator.path} className="group block" prefetch={false}>
      <Card className={cardClasses}>
        <CardHeader className="space-y-4">
          <div className="flex items-start justify-between">
            <div className={cn(
              "p-3 rounded-xl transition-all duration-300 group-hover:scale-110",
              isWealthFocused && "bg-gradient-to-br from-emerald-500/10 to-emerald-500/20 group-hover:from-emerald-500/20 group-hover:to-emerald-500/30",
              isOpportunityFocused && "bg-gradient-to-br from-amber-500/10 to-amber-500/20 group-hover:from-amber-500/20 group-hover:to-amber-500/30",
              !isWealthFocused && !isOpportunityFocused && "bg-gradient-to-br from-primary/10 to-primary/20 group-hover:from-primary/20 group-hover:to-primary/30"
            )}>
              <Icon className={cn(
                "h-6 w-6 transition-colors duration-300", 
                calculator.color,
                isWealthFocused && "group-hover:text-emerald-600",
                isOpportunityFocused && "group-hover:text-amber-600",
                !isWealthFocused && !isOpportunityFocused && "group-hover:text-primary"
              )} />
            </div>
            
            <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-110">
              {isWealthFocused && <TrendingUp className="h-4 w-4 wealth-text" />}
              {isOpportunityFocused && <Zap className="h-4 w-4 opportunity-text" />}
              {!isWealthFocused && !isOpportunityFocused && <TrendingUp className="h-4 w-4 text-primary" />}
            </div>
          </div>
          
          <div className="space-y-3">
            <CardTitle className={cn(
              "text-lg font-semibold transition-colors duration-300 leading-tight",
              isWealthFocused && "group-hover:text-emerald-700 dark:group-hover:text-emerald-400",
              isOpportunityFocused && "group-hover:text-amber-700 dark:group-hover:text-amber-400",
              !isWealthFocused && !isOpportunityFocused && "group-hover:text-primary"
            )}>
              {calculator.name}
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground leading-relaxed">
              {calculator.description}
            </CardDescription>
            
            {/* Wealth/Opportunity indicators */}
            {isWealthFocused && (
              <div className="growth-indicator">
                <TrendingUp className="h-3 w-3" />
                <span>Wealth Builder</span>
              </div>
            )}
            {isOpportunityFocused && (
              <div className="opportunity-badge">
                <Zap className="h-3 w-3" />
                <span>Smart Tool</span>
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="flex items-center justify-between">
            <div className={cn(
              "flex items-center text-sm font-medium transition-colors duration-300",
              isWealthFocused && "text-emerald-600 group-hover:text-emerald-700 dark:group-hover:text-emerald-400",
              isOpportunityFocused && "text-amber-600 group-hover:text-amber-700 dark:group-hover:text-amber-400",
              !isWealthFocused && !isOpportunityFocused && "text-primary group-hover:text-primary/80"
            )}>
              <span>Start Calculating</span>
              <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform duration-300" />
            </div>
            
            <div className="flex space-x-1">
              <div className={cn(
                "w-1.5 h-1.5 rounded-full transition-colors duration-300",
                isWealthFocused ? "bg-emerald-500/30 group-hover:bg-emerald-500" : 
                isOpportunityFocused ? "bg-amber-500/30 group-hover:bg-amber-500" :
                "bg-primary/30 group-hover:bg-primary"
              )}></div>
              <div className={cn(
                "w-1.5 h-1.5 rounded-full transition-colors duration-300 delay-75",
                isWealthFocused ? "bg-emerald-500/30 group-hover:bg-emerald-500" : 
                isOpportunityFocused ? "bg-amber-500/30 group-hover:bg-amber-500" :
                "bg-primary/30 group-hover:bg-primary"
              )}></div>
              <div className={cn(
                "w-1.5 h-1.5 rounded-full transition-colors duration-300 delay-150",
                isWealthFocused ? "bg-emerald-500/30 group-hover:bg-emerald-500" : 
                isOpportunityFocused ? "bg-amber-500/30 group-hover:bg-amber-500" :
                "bg-primary/30 group-hover:bg-primary"
              )}></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}