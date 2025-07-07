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
      <div className="border-b border-border bg-muted/30">
        <div className="container-simple">
          <div className="flex items-center justify-between py-4">
            <Button variant="outline" asChild>
              <Link href="/">
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </Button>
            
            <div className="flex items-center gap-2 text-small">
              <Calculator className="h-4 w-4" />
              <span>Financial Calculator</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="fade-in">
        {children}
      </div>
    </MainLayout>
  );
}