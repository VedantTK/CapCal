
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

const cagrSchema = z.object({
  initialValue: z.coerce.number().positive("Initial value must be positive."),
  finalValue: z.coerce.number().positive("Final value must be positive."),
  timePeriod: z.coerce.number().int().min(1, "Time period must be at least 1 year.").max(100, "Time period seems too long."),
}).refine(data => data.finalValue >= data.initialValue, {
  message: "Final value must be greater than or equal to initial value.",
  path: ["finalValue"],
});

type CagrFormValues = z.infer<typeof cagrSchema>;

interface CagrResult {
  cagr: number;
}

interface CagrCalculatorFormProps {
  calculatorName: string;
}

export default function CagrCalculatorForm({ calculatorName }: CagrCalculatorFormProps) {
  const { selectedCurrencySymbol } = useCurrency();
  const [result, setResult] = useState<CagrResult | null>(null);

  const form = useForm<CagrFormValues>({
    resolver: zodResolver(cagrSchema),
    defaultValues: {
      initialValue: undefined,
      finalValue: undefined,
      timePeriod: 5,
    },
  });

  function onSubmit(data: CagrFormValues) {
    const { initialValue, finalValue, timePeriod } = data;
    const cagrValue = (Math.pow(finalValue / initialValue, 1 / timePeriod) - 1) * 100;
    setResult({ cagr: cagrValue });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{calculatorName}</CardTitle>
        <CardDescription>Calculate the Compound Annual Growth Rate of an investment.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <FormField
                control={form.control}
                name="initialValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Initial Investment Value ({selectedCurrencySymbol})</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 10000" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="finalValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Final Investment Value ({selectedCurrencySymbol})</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 25000" {...field} value={field.value ?? ""} />
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
                    <FormControl>
                      <Input type="number" placeholder="e.g., 5" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
          <CardFooter className="flex-col items-stretch gap-4">
            <Button type="submit" className="w-full sm:w-auto">Calculate CAGR</Button>
            {result && (
              <Card className="w-full bg-muted/50">
                <CardHeader>
                  <CardTitle>CAGR Result</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Metric</TableHead>
                        <TableHead className="text-right">Value</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-semibold">Compound Annual Growth Rate (CAGR)</TableCell>
                        <TableCell className="text-right font-bold text-emerald-600">{result.cagr.toFixed(2)}%</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                  <FormDescription className="mt-4">
                    CAGR represents the mean annual growth rate of an investment over a specified period longer than one year.
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
