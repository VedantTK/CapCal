import Link from 'next/link';
import type { CalculatorInfo } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CalculatorCardProps {
  calculator: CalculatorInfo;
}

export default function CalculatorCard({ calculator }: CalculatorCardProps) {
  const Icon = calculator.icon;
  return (
    <Link href={calculator.path} className="group block" prefetch={false}>
      <Card className="h-full transition-all duration-200 ease-in-out group-hover:shadow-xl group-hover:border-primary">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base font-medium font-headline group-hover:text-primary">
            {calculator.name}
          </CardTitle>
          <Icon className={cn("h-6 w-6 text-muted-foreground group-hover:text-primary", calculator.color)} />
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {calculator.description}
          </p>
          <div className="mt-4 flex items-center text-xs text-primary group-hover:underline">
            Open Calculator <ArrowRight className="ml-1 h-4 w-4" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
