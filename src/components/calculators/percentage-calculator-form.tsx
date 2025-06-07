
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
// import { useCurrency } from "@/contexts/currency-context"; // Currency might not be directly applicable here
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Schema for "What is X% of Y?"
const percentageSchema = z.object({
  percentage: z.coerce.number().min(0, "Percentage cannot be negative."),
  totalValue: z.coerce.number().min(0, "Total value cannot be negative."),
});

type PercentageFormValues = z.infer<typeof percentageSchema>;

interface PercentageResult {
  calculatedValue: number;
}

interface PercentageCalculatorFormProps {
  calculatorName: string;
}

export default function PercentageCalculatorForm({ calculatorName }: PercentageCalculatorFormProps) {
  // const { selectedCurrencySymbol } = useCurrency(); // Potentially useful if Y is a currency amount
  const [result, setResult] = useState<PercentageResult | null>(null);

  const form = useForm<PercentageFormValues>({
    resolver: zodResolver(percentageSchema),
    defaultValues: {
      percentage: undefined,
      totalValue: undefined,
    },
  });

  function onSubmit(data: PercentageFormValues) {
    const calculatedValue = (data.percentage / 100) * data.totalValue;
    setResult({ calculatedValue });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{calculatorName}</CardTitle>
        <CardDescription>Calculate "What is X% of Y?". More modes coming soon.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="percentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Percentage (X%)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 20" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="totalValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Value (Y)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 500" {...field} value={field.value ?? ""} />
                    </FormControl>
                     <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
          <CardFooter className="flex-col items-stretch gap-4">
            <Button type="submit" className="w-full sm:w-auto">Calculate Percentage</Button>
            {result && (
              <Card className="w-full bg-muted/50">
                <CardHeader>
                  <CardTitle>Calculation Result</CardTitle>
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
                        <TableCell className="font-semibold">
                          {form.getValues("percentage")}% of {form.getValues("totalValue")} is:
                        </TableCell>
                        <TableCell className="text-right font-bold">
                          {/* If totalValue was a currency, you could use selectedCurrencySymbol here */}
                          {result.calculatedValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </TableCell>
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
