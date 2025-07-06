import Link from 'next/link';
import type { CalculatorInfo } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ArrowRight, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CalculatorCardProps {
  calculator: CalculatorInfo;
}

export default function CalculatorCard({ calculator }: CalculatorCardProps) {
  const Icon = calculator.icon;
  
  return (
    <Link href={calculator.path} className="group block" prefetch={false}>
      <Card className="h-full card-hover finance-card group-hover:border-primary/40 group-hover:shadow-lg">
        <CardHeader className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 group-hover:from-primary/20 group-hover:to-accent/20 transition-all duration-300">
              <Icon className={cn("h-6 w-6 transition-colors duration-300", calculator.color, "group-hover:text-primary")} />
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <TrendingUp className="h-4 w-4 text-accent" />
            </div>
          </div>
          
          <div className="space-y-2">
            <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors duration-300 leading-tight">
              {calculator.name}
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground leading-relaxed">
              {calculator.description}
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm font-medium text-primary group-hover:text-accent transition-colors duration-300">
              <span>Open Calculator</span>
              <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform duration-300" />
            </div>
            
            <div className="flex space-x-1">
              <div className="w-1.5 h-1.5 rounded-full bg-primary/30 group-hover:bg-primary transition-colors duration-300"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-accent/30 group-hover:bg-accent transition-colors duration-300 delay-75"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500/30 group-hover:bg-blue-500 transition-colors duration-300 delay-150"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}