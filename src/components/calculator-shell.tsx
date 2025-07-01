
"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { FileSpreadsheet } from 'lucide-react';

interface CalculatorShellProps {
  children: React.ReactNode;
  calculatorSlug: string;
  resultData: Record<string, any> | null;
}

export default function CalculatorShell({ children, calculatorSlug, resultData }: CalculatorShellProps) {
  const handleExportCsv = () => {
    if (!resultData) return;

    const headers = Object.keys(resultData);
    const values = Object.values(resultData).map(val => {
      // Handle potential commas in string values by wrapping them in quotes
      if (typeof val === 'string' && val.includes(',')) {
        return `"${val}"`;
      }
      return val;
    });

    const csvContent = [
      headers.join(','),
      values.join(',')
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.href) {
      URL.revokeObjectURL(link.href);
    }
    link.href = URL.createObjectURL(blob);
    link.download = `${calculatorSlug}-calculation.csv`;
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card data-ignore-pdf>
      <CardHeader>
        <CardTitle>Disclaimer &amp; Actions</CardTitle>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCsv} disabled={!resultData}>
            <FileSpreadsheet className="mr-2 h-4 w-4" /> Export to CSV
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
