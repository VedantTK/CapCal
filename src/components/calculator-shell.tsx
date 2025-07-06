
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

    let csvContent = '';

    const escapeCsvCell = (cell: any) => {
        if (cell === undefined || cell === null) return '';
        const cellStr = String(cell);
        if (/[",\n]/.test(cellStr)) {
            return `"${cellStr.replace(/"/g, '""')}"`;
        }
        return cellStr;
    };
    
    const arrayToCsv = (data: Record<string, any>[]) => {
      if (!data || data.length === 0) return '';
      const headers = Object.keys(data[0]);
      const rows = data.map(obj => 
        headers.map(header => escapeCsvCell(obj[header])).join(',')
      );
      return [headers.join(','), ...rows].join('\n');
    };
    
    // Handle complex home loan EMI with savings calculation
    if (resultData.summary && resultData.savingsSummary) {
      const originalSummaryCsv = 'Description,Value\n' + Object.entries(resultData.summary).map(([key, value]) => `${escapeCsvCell(key)},${escapeCsvCell(value)}`).join('\n');
      csvContent += 'Original Loan Projection\n' + originalSummaryCsv + '\n\n';

      const savingsSummaryCsv = 'Description,Value\n' + Object.entries(resultData.savingsSummary).map(([key, value]) => `${escapeCsvCell(key)},${escapeCsvCell(value)}`).join('\n');
      csvContent += 'With Prepayment Projection\n' + savingsSummaryCsv + '\n\n';
      
      const savingsDetailsCsv = 'Description,Value\n' + Object.entries(resultData.savingsDetails).map(([key, value]) => `${escapeCsvCell(key)},${escapeCsvCell(value)}`).join('\n');
      csvContent += 'Your Savings\n' + savingsDetailsCsv + '\n\n';

      if (resultData.newYearlySchedule && resultData.newYearlySchedule.length > 0) {
        csvContent += 'New Yearly Amortization Schedule\n';
        const yearlyDataForCsv = resultData.newYearlySchedule.map((row: any) => ({
          'Year': row.year,
          'Principal Paid': row.principal.toFixed(2),
          'Interest Paid': row.interest.toFixed(2),
          'Ending Balance': row.endingBalance.toFixed(2),
        }));
        csvContent += arrayToCsv(yearlyDataForCsv) + '\n\n';
      }
       if (resultData.newMonthlySchedule && resultData.newMonthlySchedule.length > 0) {
        csvContent += 'New Monthly Amortization Schedule\n';
        const monthlyDataForCsv = resultData.newMonthlySchedule.map((row: any) => ({
          'Month': row.month,
          'Principal Paid': row.principal.toFixed(2),
          'Interest Paid': row.interest.toFixed(2),
          'Total Payment': row.totalPayment.toFixed(2),
          'Ending Balance': row.endingBalance.toFixed(2),
        }));
        csvContent += arrayToCsv(monthlyDataForCsv) + '\n';
      }

    } else if (resultData.summary && (resultData.yearlySchedule || resultData.monthlySchedule || resultData.yearlyBreakdown)) {
      // Handle standard complex calculators (EMI, SWP, etc.)
      const summaryCsv = 'Description,Value\n' + Object.entries(resultData.summary).map(([key, value]) => `${escapeCsvCell(key)},${escapeCsvCell(value)}`).join('\n');
      csvContent += summaryCsv + '\n\n';

      if (resultData.yearlySchedule && resultData.yearlySchedule.length > 0) {
        // Differentiate between SWP and EMI yearly schedules
        if (resultData.yearlySchedule[0].interestEarned !== undefined) {
          csvContent += 'Yearly Withdrawal Schedule\n';
          const yearlyDataForCsv = resultData.yearlySchedule.map((row: any) => ({
            'Year': row.year,
            'Opening Balance': row.openingBalance.toFixed(2),
            'Total Withdrawn': row.totalWithdrawal.toFixed(2),
            'Interest Earned': row.interestEarned.toFixed(2),
            'Closing Balance': row.closingBalance.toFixed(2),
          }));
          csvContent += arrayToCsv(yearlyDataForCsv) + '\n\n';
        } else {
          csvContent += 'Yearly Amortization Schedule\n';
          const yearlyDataForCsv = resultData.yearlySchedule.map((row: any) => ({
            'Year': row.year,
            'Principal Paid': row.principal.toFixed(2),
            'Interest Paid': row.interest.toFixed(2),
            'Ending Balance': row.endingBalance.toFixed(2),
          }));
          csvContent += arrayToCsv(yearlyDataForCsv) + '\n\n';
        }
      }
      
      if (resultData.monthlySchedule && resultData.monthlySchedule.length > 0) {
        // Differentiate between SWP and EMI monthly schedules
        if (resultData.monthlySchedule[0].interestEarned !== undefined) {
            csvContent += 'Monthly Withdrawal Schedule\n';
            const monthlyDataForCsv = resultData.monthlySchedule.map((row: any) => ({
              'Month': row.month,
              'Opening Balance': row.openingBalance.toFixed(2),
              'Interest Earned': row.interestEarned.toFixed(2),
              'Withdrawal': row.withdrawal.toFixed(2),
              'Closing Balance': row.closingBalance.toFixed(2),
            }));
            csvContent += arrayToCsv(monthlyDataForCsv) + '\n';
        } else {
            csvContent += 'Monthly Amortization Schedule\n';
            const monthlyDataForCsv = resultData.monthlySchedule.map((row: any) => ({
              'Month': row.month,
              'Principal Paid': row.principal.toFixed(2),
              'Interest Paid': row.interest.toFixed(2),
              'Total Payment': row.totalPayment.toFixed(2),
              'Ending Balance': row.endingBalance.toFixed(2),
            }));
            csvContent += arrayToCsv(monthlyDataForCsv) + '\n';
        }
      }

      if (resultData.yearlyBreakdown && resultData.yearlyBreakdown.length > 0) {
        csvContent += 'Yearly SIP Amount Breakdown\n';
        const sipDataForCsv = resultData.yearlyBreakdown.map((row: any) => ({
          'Year': row.year,
          'New Monthly SIP': row.monthlySip.toFixed(2),
        }));
        csvContent += arrayToCsv(sipDataForCsv) + '\n\n';
      }

    } else { // Fallback for simple calculators
      const headers = Object.keys(resultData);
      const values = Object.values(resultData).map(val => escapeCsvCell(val));
      csvContent = [headers.join(','), values.join(',')].join('\n');
    }

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

    