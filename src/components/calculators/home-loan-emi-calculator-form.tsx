
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

const homeLoanEmiSchema = z.object({
  loanAmount: z.coerce.number().positive("Loan amount must be positive."),
  annualInterestRate: z.coerce.number().min(0, "Interest rate cannot be negative.").max(100, "Interest rate seems too high."),
  loanTenureYears: z.coerce.number().int().min(1, "Loan tenure must be at least 1 year.").max(50, "Loan tenure max 50 years."),
});

type HomeLoanEmiFormValues = z.infer<typeof homeLoanEmiSchema>;

interface MonthlyAmortizationDetail {
  month: number;
  principal: number;
  interest: number;
  totalPayment: number;
  endingBalance: number;
}

interface YearlyAmortizationDetail {
  year: number;
  principal: number;
  interest: number;
  endingBalance: number;
}

interface EmiResult {
  monthlyEmi: number;
  totalInterest: number;
  totalPayment: number;
  monthlySchedule: MonthlyAmortizationDetail[];
  yearlySchedule: YearlyAmortizationDetail[];
}

interface HomeLoanEmiCalculatorFormProps {
  calculatorName: string;
  onResultUpdate: (data: Record<string, any> | null) => void;
}

export default function HomeLoanEmiCalculatorForm({ calculatorName, onResultUpdate }: HomeLoanEmiCalculatorFormProps) {
  const { selectedCurrencySymbol } = useCurrency();
  const [result, setResult] = useState<EmiResult | null>(null);

  const form = useForm<HomeLoanEmiFormValues>({
    resolver: zodResolver(homeLoanEmiSchema),
    defaultValues: {
      loanAmount: undefined,
      annualInterestRate: 8.5,
      loanTenureYears: 20,
    },
  });

  const [loanAmount, annualInterestRate, loanTenureYears] = form.watch(['loanAmount', 'annualInterestRate', 'loanTenureYears']);
  useEffect(() => {
    setResult(null);
    onResultUpdate(null);
  }, [loanAmount, annualInterestRate, loanTenureYears, onResultUpdate]);

  function onSubmit(data: HomeLoanEmiFormValues) {
    const principal = data.loanAmount;
    const annualRate = data.annualInterestRate / 100;
    const monthlyRate = annualRate / 12;
    const numberOfMonths = data.loanTenureYears * 12;

    let emi: number;
    let totalPayment: number;
    let totalInterest: number;
    
    if (monthlyRate === 0) {
      emi = principal / numberOfMonths;
      totalPayment = principal;
      totalInterest = 0;
    } else {
      emi = principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfMonths) / (Math.pow(1 + monthlyRate, numberOfMonths) - 1);
      totalPayment = emi * numberOfMonths;
      totalInterest = totalPayment - principal;
    }

    const monthlySchedule: MonthlyAmortizationDetail[] = [];
    const yearlySchedule: YearlyAmortizationDetail[] = [];
    let beginningBalance = principal;
    let yearlyPrincipal = 0;
    let yearlyInterest = 0;

    for (let i = 1; i <= numberOfMonths; i++) {
      const interestPayment = beginningBalance * monthlyRate;
      const principalPayment = emi - interestPayment;
      const endingBalance = beginningBalance - principalPayment;

      monthlySchedule.push({
        month: i,
        principal: principalPayment,
        interest: interestPayment,
        totalPayment: emi,
        endingBalance: endingBalance,
      });

      yearlyPrincipal += principalPayment;
      yearlyInterest += interestPayment;

      if (i % 12 === 0 || i === numberOfMonths) {
        yearlySchedule.push({
          year: Math.ceil(i / 12),
          principal: yearlyPrincipal,
          interest: yearlyInterest,
          endingBalance: endingBalance,
        });
        yearlyPrincipal = 0;
        yearlyInterest = 0;
      }
      
      beginningBalance = endingBalance;
    }

    const resultData = {
      monthlyEmi: emi,
      totalInterest: totalInterest,
      totalPayment: totalPayment,
      monthlySchedule,
      yearlySchedule
    };
    setResult(resultData);

    const exportData = {
      "Loan Amount": principal,
      "Annual Interest Rate (%)": data.annualInterestRate,
      "Loan Tenure (Years)": data.loanTenureYears,
      "Monthly EMI": emi.toFixed(2),
      "Total Interest Payable": totalInterest.toFixed(2),
      "Total Payment (Principal + Interest)": totalPayment.toFixed(2),
    };
    onResultUpdate(exportData);
  }
  
  const tenureOptions = Array.from({ length: 30 }, (_, i) => i + 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{calculatorName}</CardTitle>
        <CardDescription>Calculate your Home Loan EMI and see the full amortization schedule.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <FormField
                control={form.control}
                name="loanAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loan Amount ({selectedCurrencySymbol})</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 5000000" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="annualInterestRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Annual Interest Rate (%)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 8.5" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="loanTenureYears"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loan Tenure (Years)</FormLabel>
                     <Select onValueChange={(value) => field.onChange(Number(value))} defaultValue={String(field.value)}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select tenure" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {tenureOptions.map(year => (
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
            <Button type="submit" className="w-full sm:w-auto">Calculate Home Loan EMI</Button>
            {result && (
              <Card className="w-full bg-muted/50">
                <CardHeader>
                  <CardTitle>Loan Repayment Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-semibold">Monthly EMI</TableCell>
                        <TableCell className="text-right font-bold">{selectedCurrencySymbol}{result.monthlyEmi.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Total Interest Payable</TableCell>
                        <TableCell className="text-right">{selectedCurrencySymbol}{result.totalInterest.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Total Payment (Principal + Interest)</TableCell>
                        <TableCell className="text-right">{selectedCurrencySymbol}{result.totalPayment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>

                  <Tabs defaultValue="yearly" className="w-full mt-6">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="yearly">Yearly Breakdown</TabsTrigger>
                      <TabsTrigger value="monthly">Monthly Breakdown</TabsTrigger>
                    </TabsList>
                    <TabsContent value="yearly">
                      <Card>
                        <CardHeader>
                            <CardTitle>Yearly Amortization Schedule</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="h-72">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[100px]">Year</TableHead>
                                            <TableHead className="text-right">Principal Paid</TableHead>
                                            <TableHead className="text-right">Interest Paid</TableHead>
                                            <TableHead className="text-right">Ending Balance</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {result.yearlySchedule.map((row) => (
                                            <TableRow key={row.year}>
                                                <TableCell>{row.year}</TableCell>
                                                <TableCell className="text-right">{selectedCurrencySymbol}{row.principal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                <TableCell className="text-right">{selectedCurrencySymbol}{row.interest.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                <TableCell className="text-right">{selectedCurrencySymbol}{row.endingBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </ScrollArea>
                        </CardContent>
                      </Card>
                    </TabsContent>
                    <TabsContent value="monthly">
                        <Card>
                            <CardHeader>
                                <CardTitle>Monthly Amortization Schedule</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ScrollArea className="h-72">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-[100px]">Month</TableHead>
                                                <TableHead className="text-right">Principal Paid</TableHead>
                                                <TableHead className="text-right">Interest Paid</TableHead>
                                                <TableHead className="text-right">Ending Balance</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {result.monthlySchedule.map((row) => (
                                                <TableRow key={row.month}>
                                                    <TableCell>{row.month}</TableCell>
                                                    <TableCell className="text-right">{selectedCurrencySymbol}{row.principal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                    <TableCell className="text-right">{selectedCurrencySymbol}{row.interest.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                    <TableCell className="text-right">{selectedCurrencySymbol}{row.endingBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </ScrollArea>
                            </CardContent>
                        </Card>
                    </TabsContent>
                  </Tabs>

                </CardContent>
              </Card>
            )}
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
