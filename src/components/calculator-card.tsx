import Link from 'next/link';
import type { CalculatorInfo } from '@/lib/types';
import { ArrowRight } from 'lucide-react';

interface CalculatorCardProps {
  calculator: CalculatorInfo;
}

export default function CalculatorCard({ calculator }: CalculatorCardProps) {
  const Icon = calculator.icon;
  
  return (
    <Link href={calculator.path} className="block" prefetch={false}>
      <div className="simple-card p-6 h-full transition-all duration-200 hover:-translate-y-1">
        <div className="space-tight">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-4">
            <Icon className={`w-6 h-6 ${calculator.color || 'text-primary'}`} />
          </div>
          
          {/* Content */}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg leading-tight">
              {calculator.name}
            </h3>
            <p className="text-small leading-relaxed">
              {calculator.description}
            </p>
          </div>
          
          {/* Action */}
          <div className="flex items-center text-primary text-sm font-medium pt-4">
            <span>Calculate</span>
            <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </div>
    </Link>
  );
}