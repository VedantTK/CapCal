
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

const stockSplitSchema = z.object({
  currentShares: z.coerce.number().int().positive("Number of shares must be a positive integer."),
  currentPrice: z.coerce.number().positive("Current price must be positive."),
  splitRatioNew: z.coerce.number().int().positive("Split ratio (new) must be a positive integer."),
  splitRatioOld: z.coerce.number().int().positive("Split ratio (old) must be a positive integer."),
}).refine(data => data.splitRatioNew !== data.splitRatioOld, {
  message: "New and old split ratio parts cannot be the same.",
  path: ["splitRatioNew"], // Or splitRatioOld
});

type StockSplitFormValues = z.infer<typeof stockSplitSchema>;

interface StockSplitResult {
  newShares: number;
  newPrice: number;
  splitRatioText: string;
}

interface StockSplitCalculatorFormProps {
  calculatorName: string;
}

export default function StockSplitCalculatorForm({ calculatorName }: StockSplitCalculatorFormProps) {
  const { selectedCurrencySymbol } = useCurrency();
  const [result, setResult] = useState<StockSplitResult | null>(null);

  const form = useForm<StockSplitFormValues>({
    resolver: zodResolver(stockSplitSchema),
    defaultValues: {
      currentShares: undefined,
      currentPrice: undefined,
      splitRatioNew: 2, // Common default for a 2-for-1 split
      splitRatioOld: 1,
    },
  });

  function onSubmit(data: StockSplitFormValues) {
    const { currentShares, currentPrice, splitRatioNew, splitRatioOld } = data;
    
    const newShares = (currentShares * splitRatioNew) / splitRatioOld;
    const newPrice = (currentPrice * splitRatioOld) / splitRatioNew;
    
    const splitRatioText = `${splitRatioNew}-for-${splitRatioOld}`;

    setResult({
      newShares,
      newPrice,
      splitRatioText,
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{calculatorName}</CardTitle>
        <CardDescription>Calculate the impact of a stock split or reverse split on your holdings.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="currentShares"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Number of Shares</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 100" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="currentPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Share Price ({selectedCurrencySymbol})</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 50" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <CardDescription>Enter the stock split ratio (e.g., for a 2-for-1 split, enter New: 2, Old: 1. For a 1-for-5 reverse split, enter New: 1, Old: 5).</CardDescription>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="splitRatioNew"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Split Ratio: New Shares</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 2" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="splitRatioOld"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Split Ratio: Old Shares</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 1" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
          <CardFooter className="flex-col items-stretch gap-4">
            <Button type="submit" className="w-full sm:w-auto">Calculate Post-Split Values</Button>
            {result && (
              <Card className="w-full bg-muted/50">
                <CardHeader>
                  <CardTitle>Post-Split Details ({result.splitRatioText} Split)</CardTitle>
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
                        <TableCell className="font-semibold">New Number of Shares</TableCell>
                        <TableCell className="text-right font-bold">{result.newShares.toLocaleString(undefined, { maximumFractionDigits: 0 })}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-semibold">New Share Price</TableCell>
                        <TableCell className="text-right font-bold">{selectedCurrencySymbol}{result.newPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                      </TableRow>
                       <TableRow>
                        <TableCell>Total Value of Holding</TableCell>
                        <TableCell className="text-right">{selectedCurrencySymbol}{(result.newShares * result.newPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                  <FormDescription className="mt-4">
                    Note: The total value of your holding typically remains the same immediately after a stock split, excluding any market fluctuations or fees.
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
