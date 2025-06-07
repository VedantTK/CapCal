
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
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const emiSchema = z.object({
  loanAmount: z.coerce.number().positive("Loan amount must be positive."),
  annualInterestRate: z.coerce.number().min(0, "Interest rate cannot be negative.").max(100, "Interest rate seems too high."),
  loanTenureYears: z.coerce.number().int().min(1, "Loan tenure must be at least 1 year.").max(50, "Loan tenure max 50 years."),
});

type EmiFormValues = z.infer<typeof emiSchema>;

interface EmiResult {
  monthlyEmi: number;
  totalInterest: number;
  totalPayment: number;
}

interface EmiCalculatorFormProps {
  calculatorName: string;
}

export default function EmiCalculatorForm({ calculatorName }: EmiCalculatorFormProps) {
  const { currency } = useCurrency();
  const [result, setResult] = useState<EmiResult | null>(null);

  const form = useForm<EmiFormValues>({
    resolver: zodResolver(emiSchema),
    defaultValues: {
      loanAmount: undefined,
      annualInterestRate: 7,
      loanTenureYears: 5,
    },
  });

  function onSubmit(data: EmiFormValues) {
    const principal = data.loanAmount;
    const annualRate = data.annualInterestRate / 100;
    const monthlyRate = annualRate / 12;
    const numberOfMonths = data.loanTenureYears * 12;

    if (monthlyRate === 0) { // Handle zero interest rate
      const monthlyEmi = principal / numberOfMonths;
       setResult({
        monthlyEmi: monthlyEmi,
        totalInterest: 0,
        totalPayment: principal,
      });
      return;
    }

    const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfMonths) / (Math.pow(1 + monthlyRate, numberOfMonths) - 1);
    const totalPayment = emi * numberOfMonths;
    const totalInterest = totalPayment - principal;

    setResult({
      monthlyEmi: emi,
      totalInterest: totalInterest,
      totalPayment: totalPayment,
    });
  }
  
  const tenureOptions = Array.from({ length: 30 }, (_, i) => i + 1);


  return (
    <Card>
      <CardHeader>
        <CardTitle>{calculatorName}</CardTitle>
        <CardDescription>Calculate your Equated Monthly Installment (EMI) for loans.</CardDescription>
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
                    <FormLabel>Loan Amount ({currency})</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 500000" {...field} value={field.value ?? ""} />
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
            <Button type="submit" className="w-full sm:w-auto">Calculate EMI</Button>
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
                        <TableCell className="text-right font-bold">{currency}{result.monthlyEmi.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Total Interest Payable</TableCell>
                        <TableCell className="text-right">{currency}{result.totalInterest.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Total Payment (Principal + Interest)</TableCell>
                        <TableCell className="text-right">{currency}{result.totalPayment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
