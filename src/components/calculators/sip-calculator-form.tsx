
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const investmentTypes = ["sip", "lumpsum"] as const;

const sipSchema = z.object({
  investmentType: z.enum(investmentTypes),
  monthlyInvestment: z.coerce.number().optional(),
  lumpsumAmount: z.coerce.number().optional(),
  annualReturnRate: z.coerce.number().min(0, "Return rate cannot be negative").max(100, "Return rate seems too high"),
  timePeriod: z.coerce.number().int().min(1, "Time period must be at least 1 year").max(50, "Time period max 50 years"),
}).superRefine((data, ctx) => {
  if (data.investmentType === "sip" && (data.monthlyInvestment === undefined || data.monthlyInvestment <= 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Monthly investment amount is required for SIP and must be positive.",
      path: ["monthlyInvestment"],
    });
  }
  if (data.investmentType === "lumpsum" && (data.lumpsumAmount === undefined || data.lumpsumAmount <= 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Lumpsum amount is required and must be positive.",
      path: ["lumpsumAmount"],
    });
  }
});

type SipFormValues = z.infer<typeof sipSchema>;

interface SipResult {
  investedAmount: number;
  estimatedReturns: number;
  totalValue: number;
  investmentType: typeof investmentTypes[number];
}

interface SipCalculatorFormProps {
  calculatorName: string;
  onResultUpdate: (data: Record<string, any> | null) => void;
}

export default function SipCalculatorForm({ calculatorName, onResultUpdate }: SipCalculatorFormProps) {
  const { selectedCurrencySymbol } = useCurrency();
  const [result, setResult] = useState<SipResult | null>(null);

  const form = useForm<SipFormValues>({
    resolver: zodResolver(sipSchema),
    defaultValues: {
      investmentType: "sip",
      monthlyInvestment: undefined,
      lumpsumAmount: undefined,
      annualReturnRate: 10, 
      timePeriod: 10, 
    },
  });

  const investmentType = form.watch("investmentType");
  
  // Watch all relevant fields to reset result on change
  const [monthlyInvestment, lumpsumAmount, annualReturnRate, timePeriod] = form.watch([
      "monthlyInvestment",
      "lumpsumAmount",
      "annualReturnRate",
      "timePeriod"
  ]);

  useEffect(() => {
    setResult(null);
    onResultUpdate(null);
  }, [investmentType, monthlyInvestment, lumpsumAmount, annualReturnRate, timePeriod, onResultUpdate]);

  function onSubmit(data: SipFormValues) {
    let totalValue = 0;
    let investedAmount = 0;

    const annualRate = data.annualReturnRate / 100;
    const years = data.timePeriod;

    if (data.investmentType === "sip" && data.monthlyInvestment) {
      const monthlyRate = annualRate / 12;
      const numberOfMonths = years * 12;
      const P = data.monthlyInvestment;
      totalValue = P * ( (Math.pow(1 + monthlyRate, numberOfMonths) - 1) / monthlyRate );
      investedAmount = P * numberOfMonths;
    } else if (data.investmentType === "lumpsum" && data.lumpsumAmount) {
      const P = data.lumpsumAmount;
      totalValue = P * Math.pow(1 + annualRate, years);
      investedAmount = P;
    }

    const estimatedReturns = totalValue - investedAmount;
    const resultData = {
      investedAmount,
      estimatedReturns,
      totalValue,
      investmentType: data.investmentType,
    };
    setResult(resultData);

    const exportData = {
      'Investment Type': data.investmentType,
      'Investment Amount': data.investmentType === 'sip' ? data.monthlyInvestment : data.lumpsumAmount,
      'Expected Annual Return Rate (%)': data.annualReturnRate,
      'Time Period (Years)': data.timePeriod,
      'Total Amount Invested': investedAmount.toFixed(2),
      'Estimated Returns': estimatedReturns.toFixed(2),
      'Projected Total Value': totalValue.toFixed(2),
    };
    onResultUpdate(exportData);
  }

  const timePeriodOptions = Array.from({ length: 50 }, (_, i) => i + 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{calculatorName}</CardTitle>
        <CardDescription>Estimate the future value of your investments.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="investmentType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Investment Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={(value) => {
                        field.onChange(value);
                        if (value === "sip") {
                          form.setValue("lumpsumAmount", undefined);
                        } else {
                          form.setValue("monthlyInvestment", undefined);
                        }
                      }}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1 sm:flex-row sm:space-y-0 sm:space-x-4"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="sip" />
                        </FormControl>
                        <FormLabel className="font-normal">Monthly SIP (Systematic Investment Plan)</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="lumpsum" />
                        </FormControl>
                        <FormLabel className="font-normal">Lumpsum (One-time)</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {investmentType === "sip" && (
              <FormField
                control={form.control}
                name="monthlyInvestment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monthly Investment Amount ({selectedCurrencySymbol})</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 5000" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {investmentType === "lumpsum" && (
              <FormField
                control={form.control}
                name="lumpsumAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lumpsum Amount ({selectedCurrencySymbol})</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 100000" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="annualReturnRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expected Annual Return Rate (%)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 12" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="timePeriod"
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
                  <CardTitle>Investment Projection</CardTitle>
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
                        <TableCell className="text-right">{selectedCurrencySymbol}{result.investedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
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
