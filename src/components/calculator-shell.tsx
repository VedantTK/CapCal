
"use client";

import { useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';

interface CalculatorShellProps {
  children: React.ReactNode;
  calculatorSlug: string;
}

export default function CalculatorShell({ children, calculatorSlug }: CalculatorShellProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const handleExportPdf = async () => {
    const element = printRef.current;
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
    });

    // Revert background color change
    if (isDarkMode) {
      element.style.backgroundColor = originalBackgroundColor;
    }


    const data = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      // Make pdf size slightly larger than canvas to avoid cutoff
      format: [canvas.width + 20, canvas.height + 20], 
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    // Center the image on the PDF page
    const x = (pdfWidth - canvasWidth) / 2;
    const y = (pdfHeight - canvasHeight) / 2;

    pdf.addImage(data, 'PNG', x > 0 ? x : 0, y > 0 ? y : 0, canvasWidth, canvasHeight);
    pdf.save(`${calculatorSlug}-calculation.pdf`);
  };

  return (
    <>
      <div ref={printRef} className="p-1">
        {children}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Disclaimer &amp; Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            Disclaimer: Calculations are estimates and intended for informational purposes only. Always consult with a financial advisor before making investment decisions. Market risks apply.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportPdf}>
              <FileText className="mr-2 h-4 w-4" /> Export to PDF
            </Button>
          </div>
        </CardFooter>
      </Card>
    </>
  );
}
