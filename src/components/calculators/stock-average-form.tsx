
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

const stockAverageSchema = z.object({
  firstBuyPrice: z.coerce.number().min(0.01, "Price must be greater than 0"),
  firstBuyQuantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
  secondBuyPrice: z.coerce.number().min(0.01, "Price must be greater than 0").optional(),
  secondBuyQuantity: z.coerce.number().int().min(1, "Quantity must be at least 1").optional(),
});

type StockAverageFormValues = z.infer<typeof stockAverageSchema>;

interface StockAverageResult {
  averagePrice: number;
  totalQuantity: number;
  totalInvestment: number;
}

interface StockAverageFormProps {
  calculatorName: string;
}

export default function StockAverageForm({ calculatorName }: StockAverageFormProps) {
  const { currency } = useCurrency();
  const [result, setResult] = useState<StockAverageResult | null>(null);

  const form = useForm<StockAverageFormValues>({
    resolver: zodResolver(stockAverageSchema),
    defaultValues: {
      firstBuyPrice: undefined,
      firstBuyQuantity: undefined,
      secondBuyPrice: undefined,
      secondBuyQuantity: undefined,
    },
  });

  function onSubmit(data: StockAverageFormValues) {
    let totalCost = data.firstBuyPrice * data.firstBuyQuantity;
    let totalQuantity = data.firstBuyQuantity;

    if (data.secondBuyPrice && data.secondBuyQuantity) {
      totalCost += data.secondBuyPrice * data.secondBuyQuantity;
      totalQuantity += data.secondBuyQuantity;
    }

    const averagePrice = totalCost / totalQuantity;
    setResult({
      averagePrice,
      totalQuantity,
      totalInvestment: totalCost,
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{calculatorName}</CardTitle>
        <CardDescription>Calculate the average price of your stock holdings after multiple purchases.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="firstBuyPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Buy Price ({currency})</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 100.50" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="firstBuyQuantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Buy Quantity</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 10" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="secondBuyPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Second Buy Price ({currency}) (Optional)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 95.25" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="secondBuyQuantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Second Buy Quantity (Optional)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 5" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
             <FormDescription>
              Enter details for up to two buy transactions. More can be added by recalculating.
            </FormDescription>
          </CardContent>
          <CardFooter className="flex-col items-stretch gap-4">
            <Button type="submit" className="w-full sm:w-auto">Calculate Average Price</Button>
            {result && (
              <Card className="w-full bg-muted/50">
                <CardHeader>
                  <CardTitle>Calculation Results</CardTitle>
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
                        <TableCell>Average Purchase Price</TableCell>
                        <TableCell className="text-right font-semibold">{currency}{result.averagePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Total Quantity</TableCell>
                        <TableCell className="text-right">{result.totalQuantity} shares</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Total Investment</TableCell>
                        <TableCell className="text-right">{currency}{result.totalInvestment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
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
