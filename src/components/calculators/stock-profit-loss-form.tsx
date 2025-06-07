
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
import { cn } from "@/lib/utils";


const profitLossSchema = z.object({
  buyPrice: z.coerce.number().min(0.01, "Buy price must be positive."),
  sellPrice: z.coerce.number().min(0.01, "Sell price must be positive."),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1."),
  buyCommission: z.coerce.number().min(0, "Commission cannot be negative.").optional(),
  sellCommission: z.coerce.number().min(0, "Commission cannot be negative.").optional(),
});

type ProfitLossFormValues = z.infer<typeof profitLossSchema>;

interface ProfitLossResult {
  totalBuyCost: number;
  totalSellValue: number;
  grossProfitLoss: number;
  netProfitLoss: number;
  profitLossPercentage: number;
  isProfit: boolean;
}

interface StockProfitLossFormProps {
  calculatorName: string;
}

export default function StockProfitLossForm({ calculatorName }: StockProfitLossFormProps) {
  const { currency } = useCurrency();
  const [result, setResult] = useState<ProfitLossResult | null>(null);

  const form = useForm<ProfitLossFormValues>({
    resolver: zodResolver(profitLossSchema),
    defaultValues: {
      buyPrice: undefined,
      sellPrice: undefined,
      quantity: undefined,
      buyCommission: 0,
      sellCommission: 0,
    },
  });

  function onSubmit(data: ProfitLossFormValues) {
    const initialBuyCost = data.buyPrice * data.quantity;
    const totalBuyCost = initialBuyCost + (data.buyCommission || 0);
    
    const initialSellValue = data.sellPrice * data.quantity;
    const totalSellValue = initialSellValue - (data.sellCommission || 0);

    const grossProfitLoss = initialSellValue - initialBuyCost;
    const netProfitLoss = totalSellValue - totalBuyCost;
    
    const profitLossPercentage = totalBuyCost > 0 ? (netProfitLoss / totalBuyCost) * 100 : 0;

    setResult({
      totalBuyCost,
      totalSellValue,
      grossProfitLoss,
      netProfitLoss,
      profitLossPercentage,
      isProfit: netProfitLoss >= 0,
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{calculatorName}</CardTitle>
        <CardDescription>Calculate your profit or loss from a stock trade.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <FormField
                control={form.control}
                name="buyPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Buy Price per Share ({currency})</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 100" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sellPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sell Price per Share ({currency})</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 120" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity of Shares</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 50" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="buyCommission"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Buy Commission ({currency}) (Optional)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 5" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sellCommission"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sell Commission ({currency}) (Optional)</FormLabel>
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
            <Button type="submit" className="w-full sm:w-auto">Calculate Profit/Loss</Button>
            {result && (
              <Card className="w-full bg-muted/50">
                <CardHeader>
                  <CardTitle>Trade Summary</CardTitle>
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
                        <TableCell>Total Buy Cost (incl. commission)</TableCell>
                        <TableCell className="text-right">{currency}{result.totalBuyCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Total Sell Value (after commission)</TableCell>
                        <TableCell className="text-right">{currency}{result.totalSellValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Gross Profit / Loss</TableCell>
                        <TableCell className={cn("text-right", result.grossProfitLoss >= 0 ? "text-emerald-600" : "text-red-600")}>
                          {currency}{result.grossProfitLoss.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </TableCell>
                      </TableRow>
                       <TableRow>
                        <TableCell className="font-semibold">Net Profit / Loss</TableCell>
                        <TableCell className={cn("text-right font-bold", result.isProfit ? "text-emerald-600" : "text-red-600")}>
                          {result.isProfit ? '+' : ''}{currency}{result.netProfitLoss.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-semibold">Net Profit / Loss Percentage</TableCell>
                        <TableCell className={cn("text-right font-bold", result.isProfit ? "text-emerald-600" : "text-red-600")}>
                          {result.isProfit ? '+' : ''}{result.profitLossPercentage.toFixed(2)}%
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
