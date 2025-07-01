
"use client";

import { useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, FileSpreadsheet } from 'lucide-react';

interface CalculatorShellProps {
  children: React.ReactNode;
  calculatorSlug: string;
  resultData: Record<string, any> | null;
}

export default function CalculatorShell({ children, calculatorSlug, resultData }: CalculatorShellProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const handleExportPdf = async () => {
    // We target the parent of the shell which contains the actual calculator form.
    const element = printRef.current?.parentElement;
    if (!element) {
      console.error("The element to print was not found.");
      return;
    }
    
    // Temporarily change background color for capture if in dark mode
    const isDarkMode = document.documentElement.classList.contains('dark');
    const originalBackgroundColor = element.style.backgroundColor;
    if (isDarkMode) {
      element.style.backgroundColor = '#ffffff'; // Use a light background for PDF
    }
    
    const canvas = await html2canvas(element, {
      scale: 2, // Improve resolution
      backgroundColor: isDarkMode ? '#ffffff' : null, // Ensure background is white for dark mode
      // Select only the calculator card and not the disclaimer/actions card.
      ignoreElements: (el) => el.hasAttribute('data-ignore-pdf'),
    });

    // Revert background color change
    if (isDarkMode) {
      element.style.backgroundColor = originalBackgroundColor;
    }


    const data = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: [canvas.width + 20, canvas.height + 20], 
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    // Scale image to fit pdf width if it's too large
    const imgProps = pdf.getImageProperties(data);
    const pdfCanvasWidth = pdfWidth - 20; // with some padding
    const pdfCanvasHeight = (imgProps.height * pdfCanvasWidth) / imgProps.width;

    const x = (pdfWidth - pdfCanvasWidth) / 2;
    const y = (pdfHeight - pdfCanvasHeight) / 2;

    pdf.addImage(data, 'PNG', x > 0 ? x : 0, y > 0 ? y : 0, pdfCanvasWidth, pdfCanvasHeight);
    pdf.save(`${calculatorSlug}-calculation.pdf`);
  };

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
    <div ref={printRef}>
      <Card data-ignore-pdf>
        <CardHeader>
          <CardTitle>Disclaimer &amp; Actions</CardTitle>
        </CardHeader>
        <CardContent>
          {children}
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportPdf}>
              <FileText className="mr-2 h-4 w-4" /> Export to PDF
            </Button>
            <Button variant="outline" onClick={handleExportCsv} disabled={!resultData}>
              <FileSpreadsheet className="mr-2 h-4 w-4" /> Export to CSV
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
