
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useCurrency } from "@/contexts/currency-context";
import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const swpSchema = z.object({
  totalInvestment: z.coerce.number().positive("Total investment must be positive."),
  monthlyWithdrawal: z.coerce.number().positive("Monthly withdrawal must be positive."),
  annualReturnRate: z.coerce.number().min(0, "Return rate cannot be negative.").max(100, "Return rate seems too high."),
  investmentPeriodYears: z.coerce.number().int().min(1, "Investment period must be at least 1 year.").max(50, "Period max 50 years."),
});

type SwpFormValues = z.infer<typeof swpSchema>;

interface MonthlyScheduleDetail {
  month: number;
  openingBalance: number;
  interestEarned: number;
  withdrawal: number;
  closingBalance: number;
}

interface YearlyScheduleDetail {
  year: number;
  openingBalance: number;
  totalWithdrawal: number;
  interestEarned: number;
  closingBalance: number;
}

interface SwpResult {
  totalWithdrawn: number;
  finalBalance: number;
  investmentYears: number;
  annualReturnRate: number;
  monthlySchedule: MonthlyScheduleDetail[];
  yearlySchedule: YearlyScheduleDetail[];
}

interface SwpCalculatorFormProps {
  calculatorName: string;
  onResultUpdate: (data: Record<string, any> | null) => void;
}

export default function SwpCalculatorForm({ calculatorName, onResultUpdate }: SwpCalculatorFormProps) {
  const { selectedCurrencySymbol } = useCurrency();
  const [result, setResult] = useState<SwpResult | null>(null);
  const [activeView, setActiveView] = useState<'yearly' | 'monthly'>('yearly');

  const form = useForm<SwpFormValues>({
    resolver: zodResolver(swpSchema),
    defaultValues: {
      totalInvestment: undefined,
      monthlyWithdrawal: undefined,
      annualReturnRate: 7,
      investmentPeriodYears: 10,
    },
  });

  const [totalInvestment, monthlyWithdrawal, annualReturnRate, investmentPeriodYears] = form.watch(['totalInvestment', 'monthlyWithdrawal', 'annualReturnRate', 'investmentPeriodYears']);
  useEffect(() => {
    setResult(null);
    onResultUpdate(null);
  }, [totalInvestment, monthlyWithdrawal, annualReturnRate, investmentPeriodYears, onResultUpdate]);


  function onSubmit(data: SwpFormValues) {
    let balance = data.totalInvestment;
    let totalWithdrawnAmount = 0;
    const monthlyReturnRate = data.annualReturnRate / 100 / 12;
    const numberOfMonths = data.investmentPeriodYears * 12;
    const monthlySchedule: MonthlyScheduleDetail[] = [];
    const yearlySchedule: YearlyScheduleDetail[] = [];

    let yearlyWithdrawn = 0;
    let yearlyInterest = 0;
    let openingBalanceForYear = balance;

    for (let month = 1; month <= numberOfMonths; month++) {
        if (balance <= 0) break;

        const openingBalanceForMonth = balance;
        const interestForMonth = balance * monthlyReturnRate;
        balance += interestForMonth;
        
        const withdrawalForMonth = Math.min(balance, data.monthlyWithdrawal);
        balance -= withdrawalForMonth;
        
        const closingBalanceForMonth = balance;

        monthlySchedule.push({
            month,
            openingBalance: openingBalanceForMonth,
            interestEarned: interestForMonth,
            withdrawal: withdrawalForMonth,
            closingBalance: closingBalanceForMonth,
        });
        
        totalWithdrawnAmount += withdrawalForMonth;
        yearlyWithdrawn += withdrawalForMonth;
        yearlyInterest += interestForMonth;

        if (month % 12 === 0 || month === numberOfMonths || balance <= 0) {
            const year = Math.ceil(month / 12);
            yearlySchedule.push({
                year,
                openingBalance: openingBalanceForYear,
                totalWithdrawal: yearlyWithdrawn,
                interestEarned: yearlyInterest,
                closingBalance: closingBalanceForMonth,
            });
            
            yearlyWithdrawn = 0;
            yearlyInterest = 0;
            openingBalanceForYear = closingBalanceForMonth;
            if (balance <= 0) break;
        }
    }
    
    const finalBalance = balance > 0 ? balance : 0;
    const resultData = {
      totalWithdrawn: totalWithdrawnAmount,
      finalBalance,
      investmentYears: data.investmentPeriodYears,
      annualReturnRate: data.annualReturnRate,
      monthlySchedule,
      yearlySchedule,
    };
    setResult(resultData);

    const exportData = {
      summary: {
        "Total Investment": data.totalInvestment,
        "Monthly Withdrawal Amount": data.monthlyWithdrawal,
        "Expected Annual Return Rate (%)": data.annualReturnRate,
        "Investment Period (Years)": data.investmentPeriodYears,
        "Total Amount Withdrawn": totalWithdrawnAmount.toFixed(2),
        "Final Balance": finalBalance.toFixed(2),
      },
      yearlySchedule,
      monthlySchedule
    };
    onResultUpdate(exportData);
  }

  const periodOptions = Array.from({ length: 50 }, (_, i) => i + 1);


  return (
    <Card>
      <CardHeader>
        <CardTitle>{calculatorName}</CardTitle>
        <CardDescription>Estimate your Systematic Withdrawal Plan (SWP) details.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="totalInvestment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Investment ({selectedCurrencySymbol})</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 1000000" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="monthlyWithdrawal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monthly Withdrawal Amount ({selectedCurrencySymbol})</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 5000" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="annualReturnRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expected Annual Return Rate (%)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 7" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="investmentPeriodYears"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Investment Period (Years)</FormLabel>
                     <Select onValueChange={(value) => field.onChange(Number(value))} defaultValue={String(field.value)}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select period" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {periodOptions.map(year => (
                          <SelectItem key={year} value={String(year)}>{year} Year{year > 1 ? 's' : ''}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
          <CardFooter className="flex-col items-stretch gap-4">
            <Button type="submit" className="w-full sm:w-auto">Calculate SWP</Button>
            {result && (
              <Card className="w-full bg-muted/50">
                <CardHeader>
                  <CardTitle>SWP Projection</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Value</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>Total Amount Withdrawn</TableCell>
                        <TableCell className="text-right">{selectedCurrencySymbol}{result.totalWithdrawn.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-semibold">Final Balance After {result.investmentYears} Years</TableCell>
                        <TableCell className="text-right font-bold">{selectedCurrencySymbol}{result.finalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                  <FormDescription className="mt-4">
                    Projected values after {result.investmentYears} years with an expected annual return of {result.annualReturnRate}%.
                    Actual returns may vary. If the final balance is zero, your investment may have depleted before the end of the period based on the inputs.
                  </FormDescription>

                  <div className="w-full mt-6 sm:hidden">
                    <Select value={activeView} onValueChange={(v) => setActiveView(v as 'yearly' | 'monthly')}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select breakdown view" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="yearly">Yearly Breakdown</SelectItem>
                            <SelectItem value="monthly">Monthly Breakdown</SelectItem>
                        </SelectContent>
                    </Select>
                  </div>

                  <Tabs value={activeView} onValueChange={(v) => setActiveView(v as 'yearly' | 'monthly')} className="hidden w-full mt-6 sm:block">
                      <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="yearly">Yearly Breakdown</TabsTrigger>
                          <TabsTrigger value="monthly">Monthly Breakdown</TabsTrigger>
                      </TabsList>
                  </Tabs>

                  <div className="mt-4">
                    {activeView === 'yearly' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Yearly Withdrawal Schedule</CardTitle>
                            </CardHeader>
                            <CardContent className="overflow-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Year</TableHead>
                                            <TableHead className="text-right">Opening Balance</TableHead>
                                            <TableHead className="text-right">Total Withdrawn</TableHead>
                                            <TableHead className="text-right">Interest Earned</TableHead>
                                            <TableHead className="text-right">Closing Balance</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {result.yearlySchedule.map((row) => (
                                            <TableRow key={row.year}>
                                                <TableCell>{row.year}</TableCell>
                                                <TableCell className="text-right">{selectedCurrencySymbol}{row.openingBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                <TableCell className="text-right">{selectedCurrencySymbol}{row.totalWithdrawal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                <TableCell className="text-right">{selectedCurrencySymbol}{row.interestEarned.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                <TableCell className="text-right">{selectedCurrencySymbol}{row.closingBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    )}
                    {activeView === 'monthly' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Monthly Withdrawal Schedule</CardTitle>
                            </CardHeader>
                            <CardContent className="overflow-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Month</TableHead>
                                            <TableHead className="text-right">Opening Balance</TableHead>
                                            <TableHead className="text-right">Interest Earned</TableHead>
                                            <TableHead className="text-right">Withdrawal</TableHead>
                                            <TableHead className="text-right">Closing Balance</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {result.monthlySchedule.map((row) => (
                                            <TableRow key={row.month}>
                                                <TableCell>{row.month}</TableCell>
                                                <TableCell className="text-right">{selectedCurrencySymbol}{row.openingBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                <TableCell className="text-right">{selectedCurrencySymbol}{row.interestEarned.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                <TableCell className="text-right">{selectedCurrencySymbol}{row.withdrawal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                <TableCell className="text-right">{selectedCurrencySymbol}{row.closingBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}

    