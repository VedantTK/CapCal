
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const stepUpSipSchema = z.object({
  initialMonthlyInvestment: z.coerce.number().positive("Initial monthly investment must be positive."),
  annualStepUpPercentage: z.coerce.number().min(0, "Annual step-up cannot be negative.").max(50, "Annual step-up seems too high."),
  annualReturnRate: z.coerce.number().min(0, "Return rate cannot be negative.").max(100, "Return rate seems too high."),
  timePeriodYears: z.coerce.number().int().min(1, "Time period must be at least 1 year.").max(50, "Time period max 50 years."),
});

type StepUpSipFormValues = z.infer<typeof stepUpSipSchema>;

interface StepUpSipResult {
  totalInvested: number;
  estimatedReturns: number;
  totalValue: number;
}

interface StepUpSipCalculatorFormProps {
  calculatorName: string;
}

export default function StepUpSipCalculatorForm({ calculatorName }: StepUpSipCalculatorFormProps) {
  const { selectedCurrencySymbol } = useCurrency();
  const [result, setResult] = useState<StepUpSipResult | null>(null);

  const form = useForm<StepUpSipFormValues>({
    resolver: zodResolver(stepUpSipSchema),
    defaultValues: {
      initialMonthlyInvestment: undefined,
      annualStepUpPercentage: 10,
      annualReturnRate: 12,
      timePeriodYears: 10,
    },
  });

  function onSubmit(data: StepUpSipFormValues) {
    let totalInvestedAmount = 0;
    let futureValue = 0;
    let currentMonthlySip = data.initialMonthlyInvestment;
    const monthlyReturnRate = data.annualReturnRate / 100 / 12;
    const stepUpRate = data.annualStepUpPercentage / 100;

    for (let year = 1; year <= data.timePeriodYears; year++) {
      let yearlyInvestment = 0;
      for (let month = 1; month <= 12; month++) {
        futureValue = (futureValue + currentMonthlySip) * (1 + monthlyReturnRate);
        yearlyInvestment += currentMonthlySip;
      }
      totalInvestedAmount += yearlyInvestment;
      currentMonthlySip *= (1 + stepUpRate); // Increase SIP for next year
    }
    
    const estimatedReturns = futureValue - totalInvestedAmount;

    setResult({
      totalInvested: totalInvestedAmount,
      estimatedReturns,
      totalValue: futureValue,
    });
  }
  
  const timePeriodOptions = Array.from({ length: 50 }, (_, i) => i + 1);
  const stepUpOptions = Array.from({ length: 21 }, (_, i) => i * 2.5); // 0% to 50% in 2.5% increments
  const returnRateOptions = Array.from({length: 41}, (_, i) => i * 0.5 + 5); // 5% to 25% in 0.5% increments

  return (
    <Card>
      <CardHeader>
        <CardTitle>{calculatorName}</CardTitle>
        <CardDescription>Estimate the future value of your step-up SIP investments.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="initialMonthlyInvestment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Initial Monthly Investment ({selectedCurrencySymbol})</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 5000" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <FormField
                control={form.control}
                name="annualStepUpPercentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Annual Step-up (%)</FormLabel>
                    <Select onValueChange={(value) => field.onChange(Number(value))} defaultValue={String(field.value)}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select step-up %" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {stepUpOptions.map(rate => (
                          <SelectItem key={rate} value={String(rate)}>{rate}%</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="annualReturnRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expected Annual Return (%)</FormLabel>
                     <Select onValueChange={(value) => field.onChange(Number(value))} defaultValue={String(field.value)}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select rate" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {returnRateOptions.map(rate => (
                          <SelectItem key={rate} value={String(rate)}>{rate.toFixed(1)}%</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="timePeriodYears"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time Period (Years)</FormLabel>
                    <Select onValueChange={(value) => field.onChange(Number(value))} defaultValue={String(field.value)}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select years" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {timePeriodOptions.map(year => (
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
            <Button type="submit" className="w-full sm:w-auto">Calculate Future Value</Button>
            {result && (
              <Card className="w-full bg-muted/50">
                <CardHeader>
                  <CardTitle>Step-up SIP Projection</CardTitle>
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
                        <TableCell>Total Amount Invested</TableCell>
                        <TableCell className="text-right">{selectedCurrencySymbol}{result.totalInvested.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                      </TableRow>
                       <TableRow>
                        <TableCell>Estimated Returns</TableCell>
                        <TableCell className="text-right">{selectedCurrencySymbol}{result.estimatedReturns.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-semibold">Projected Total Value</TableCell>
                        <TableCell className="text-right font-bold">{selectedCurrencySymbol}{result.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                   <FormDescription className="mt-4">
                    Note: This is an estimated projection. Actual returns may vary based on market conditions.
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
