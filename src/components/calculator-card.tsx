import Link from 'next/link';
import type { CalculatorInfo } from '@/lib/types';
import { ArrowRight, TrendingUp, Zap, Sparkles } from 'lucide-react';
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
    "calculator-card h-full group",
    isWealthFocused && "wealth-card",
    isOpportunityFocused && "opportunity-card"
  );
  
  return (
    <Link href={calculator.path} className="block h-full" prefetch={false}>
      <div className={cardClasses}>
        {/* Card Header */}
        <div className="relative p-8 pb-6">
          <div className="flex items-start justify-between mb-6">
            <div className={cn(
              "relative p-4 rounded-2xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3",
              isWealthFocused && "bg-gradient-to-br from-emerald-500/15 to-emerald-600/25 group-hover:from-emerald-500/25 group-hover:to-emerald-600/35",
              isOpportunityFocused && "bg-gradient-to-br from-amber-500/15 to-amber-600/25 group-hover:from-amber-500/25 group-hover:to-amber-600/35",
              !isWealthFocused && !isOpportunityFocused && "bg-gradient-to-br from-primary/15 to-primary/25 group-hover:from-primary/25 group-hover:to-primary/35"
            )}>
              <Icon className={cn(
                "h-8 w-8 transition-all duration-300", 
                calculator.color,
                "group-hover:scale-110"
              )} />
              
              {/* Sparkle effect on hover */}
              <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Sparkles className="h-4 w-4 text-amber-400 animate-pulse" />
              </div>
            </div>
            
            {/* Status indicator */}
            <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-110">
              {isWealthFocused && (
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-200/50">
                  <TrendingUp className="h-3 w-3 wealth-text" />
                  <span className="text-xs wealth-text font-medium">Growth</span>
                </div>
              )}
              {isOpportunityFocused && (
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/10 border border-amber-200/50">
                  <Zap className="h-3 w-3 opportunity-text" />
                  <span className="text-xs opportunity-text font-medium">Smart</span>
                </div>
              )}
              {!isWealthFocused && !isOpportunityFocused && (
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 border border-primary/20">
                  <TrendingUp className="h-3 w-3 text-primary" />
                  <span className="text-xs text-primary font-medium">Pro</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Card Content */}
          <div className="space-y-4">
            <div className="space-y-3">
              <h3 className={cn(
                "text-xl font-bold transition-colors duration-300 leading-tight",
                isWealthFocused && "group-hover:text-emerald-700 dark:group-hover:text-emerald-400",
                isOpportunityFocused && "group-hover:text-amber-700 dark:group-hover:text-amber-400",
                !isWealthFocused && !isOpportunityFocused && "group-hover:text-primary"
              )}>
                {calculator.name}
              </h3>
              
              <p className="text-muted-foreground leading-relaxed text-sm">
                {calculator.description}
              </p>
            </div>
            
            {/* Category badges */}
            <div className="flex items-center gap-2">
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
              {!isWealthFocused && !isOpportunityFocused && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-gradient-to-r from-primary/10 to-primary/20 text-primary border border-primary/20 shadow-sm">
                  <TrendingUp className="h-3 w-3" />
                  <span>Professional</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Card Footer */}
        <div className="relative px-8 pb-8">
          <div className="flex items-center justify-between pt-6 border-t border-border/30">
            <div className={cn(
              "flex items-center gap-2 text-sm font-semibold transition-all duration-300 group-hover:gap-3",
              isWealthFocused && "text-emerald-600 group-hover:text-emerald-700 dark:group-hover:text-emerald-400",
              isOpportunityFocused && "text-amber-600 group-hover:text-amber-700 dark:group-hover:text-amber-400",
              !isWealthFocused && !isOpportunityFocused && "text-primary group-hover:text-primary/80"
            )}>
              <span>Start Calculating</span>
              <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform duration-300" />
            </div>
            
            {/* Progress dots */}
            <div className="flex space-x-1.5">
              {[0, 1, 2].map((index) => (
                <div
                  key={index}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all duration-300",
                    isWealthFocused ? "bg-emerald-500/30 group-hover:bg-emerald-500" : 
                    isOpportunityFocused ? "bg-amber-500/30 group-hover:bg-amber-500" :
                    "bg-primary/30 group-hover:bg-primary",
                    `delay-${index * 75}`
                  )}
                  style={{ animationDelay: `${index * 75}ms` }}
                />
              ))}
            </div>
          </div>
        </div>
        
        {/* Hover overlay effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl" />
      </div>
    </Link>
  );
}