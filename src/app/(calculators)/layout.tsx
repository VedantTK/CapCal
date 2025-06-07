import MainLayout from '@/components/layout/main-layout';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

export default function CalculatorsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MainLayout>
      <div className="mb-6">
        <Button variant="outline" asChild>
          <Link href="/">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>
      {children}
    </MainLayout>
  );
}
