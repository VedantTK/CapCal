import MainLayout from '@/components/layout/main-layout';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Calculator } from 'lucide-react';

export default function CalculatorsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Navigation Header */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20">
          <Button variant="outline" asChild className="btn-secondary">
            <Link href="/">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calculator className="h-4 w-4" />
            <span>Financial Calculator</span>
          </div>
        </div>
        
        {/* Calculator Content */}
        <div className="slide-up">
          {children}
        </div>
      </div>
    </MainLayout>
  );
}