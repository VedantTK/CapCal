
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

const swpSchema = z.object({
  totalInvestment: z.coerce.number().positive("Total investment must be positive."),
  monthlyWithdrawal: z.coerce.number().positive("Monthly withdrawal must be positive."),
  annualReturnRate: z.coerce.number().min(0, "Return rate cannot be negative.").max(100, "Return rate seems too high."),
  investmentPeriodYears: z.coerce.number().int().min(1, "Investment period must be at least 1 year.").max(50, "Period max 50 years."),
});

type SwpFormValues = z.infer<typeof swpSchema>;

interface SwpResult {
  totalWithdrawn: number;
  finalBalance: number;
  investmentYears: number;
  annualReturnRate: number;
}

interface SwpCalculatorFormProps {
  calculatorName: string;
}

export default function SwpCalculatorForm({ calculatorName }: SwpCalculatorFormProps) {
  const { currency } = useCurrency();
  const [result, setResult] = useState<SwpResult | null>(null);

  const form = useForm<SwpFormValues>({
    resolver: zodResolver(swpSchema),
    defaultValues: {
      totalInvestment: undefined,
      monthlyWithdrawal: undefined,
      annualReturnRate: 7,
      investmentPeriodYears: 10,
    },
  });

  function onSubmit(data: SwpFormValues) {
    let currentBalance = data.totalInvestment;
    let totalWithdrawnAmount = 0;
    const monthlyReturnRate = data.annualReturnRate / 100 / 12;
    const numberOfMonths = data.investmentPeriodYears * 12;

    for (let i = 0; i < numberOfMonths; i++) {
      if (currentBalance <= 0) break; // Stop if balance depletes

      // Withdraw at the beginning of the month
      const withdrawalThisMonth = Math.min(currentBalance, data.monthlyWithdrawal);
      currentBalance -= withdrawalThisMonth;
      totalWithdrawnAmount += withdrawalThisMonth;
      
      // Calculate earnings on remaining balance for the month
      if (currentBalance > 0) {
          currentBalance += currentBalance * monthlyReturnRate;
      }
    }

    setResult({
      totalWithdrawn: totalWithdrawnAmount,
      finalBalance: currentBalance > 0 ? currentBalance : 0,
      investmentYears: data.investmentPeriodYears,
      annualReturnRate: data.annualReturnRate,
    });
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
                    <FormLabel>Total Investment ({currency})</FormLabel>
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
                    <FormLabel>Monthly Withdrawal Amount ({currency})</FormLabel>
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
                        <TableCell className="text-right">{currency}{result.totalWithdrawn.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-semibold">Final Balance After {result.investmentYears} Years</TableCell>
                        <TableCell className="text-right font-bold">{currency}{result.finalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                   <FormDescription className="mt-4">
                    Projected values after {result.investmentYears} years with an expected annual return of {result.annualReturnRate}%.
                    Actual returns may vary. If the final balance is zero, your investment may have depleted before the end of the period based on the inputs.
                  </FormDescription>
                </CardContent>
              </Card>
            )}
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
