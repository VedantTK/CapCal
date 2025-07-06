
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
import { useCurrency } from "@/contexts/currency-context";
import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Home, Lightbulb, Car, UtensilsCrossed, ShieldAlert, Clapperboard, Smartphone, Repeat, ShieldCheck, Wrench, PiggyBank } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const budgetSuggesterSchema = z.object({
  monthlySalary: z.coerce.number().positive("Monthly salary must be positive."),
});

type BudgetSuggesterFormValues = z.infer<typeof budgetSuggesterSchema>;

interface BudgetItem {
  category: string;
  amount: number;
  percentage: number;
  icon: LucideIcon;
}

interface BudgetSuggesterFormProps {
  calculatorName: string;
  onResultUpdate: (data: Record<string, any> | null) => void;
}

const budgetCategories = [
    { category: 'Rent', percentage: 0.20, icon: Home },
    { category: 'Investing', percentage: 0.20, icon: PiggyBank },
    { category: 'Food & Groceries', percentage: 0.18, icon: UtensilsCrossed },
    { category: 'Emergency Fund', percentage: 0.10, icon: ShieldAlert },
    { category: 'Entertainment', percentage: 0.0828, icon: Clapperboard },
    { category: 'Transport', percentage: 0.075, icon: Car },
    { category: 'Utilities', percentage: 0.043, icon: Lightbulb },
    { category: 'Insurance', percentage: 0.0378, icon: ShieldCheck },
    { category: 'Phone & Internet', percentage: 0.0278, icon: Smartphone },
    { category: 'Subscriptions', percentage: 0.0128, icon: Repeat },
    { category: 'Miscellaneous', percentage: 0.0411, icon: Wrench }, // This will be adjusted to ensure total is 100%
];

export default function BudgetSuggesterForm({ calculatorName, onResultUpdate }: BudgetSuggesterFormProps) {
  const { selectedCurrencySymbol } = useCurrency();
  const [result, setResult] = useState<BudgetItem[] | null>(null);

  const form = useForm<BudgetSuggesterFormValues>({
    resolver: zodResolver(budgetSuggesterSchema),
    defaultValues: {
      monthlySalary: undefined,
    },
  });

  const formValues = form.watch();
  useEffect(() => {
    setResult(null);
    onResultUpdate(null);
  }, [JSON.stringify(formValues), onResultUpdate]);

  function onSubmit(data: BudgetSuggesterFormValues) {
    const { monthlySalary } = data;
    let runningTotal = 0;

    // Sort categories to ensure 'Miscellaneous' is last for adjustment calculation
    const sortedCategories = [...budgetCategories].sort((a, b) => {
        if (a.category === 'Miscellaneous') return 1;
        if (b.category === 'Miscellaneous') return -1;
        return 0;
    });

    const calculatedItems = sortedCategories.slice(0, -1).map(cat => {
        const amount = monthlySalary * cat.percentage;
        runningTotal += amount;
        return { ...cat, amount };
    });

    const lastCategory = sortedCategories[sortedCategories.length - 1];
    const lastAmount = monthlySalary - runningTotal;
    calculatedItems.push({ ...lastCategory, amount: lastAmount });
    
    // Now create the final result with percentages, unsorted
    const resultData = calculatedItems.map(item => ({
        ...item,
        percentage: (item.amount / monthlySalary) * 100
    }));

    setResult(resultData);

    const exportData = resultData.reduce((acc, item) => {
        acc[item.category] = item.amount.toFixed(2);
        return acc;
    }, {} as Record<string, string>);
    exportData["Total Amount"] = monthlySalary.toFixed(2);
    
    onResultUpdate(exportData);
  }

  const totalCalculated = result?.reduce((sum, item) => sum + item.amount, 0) ?? 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{calculatorName}</CardTitle>
        <CardDescription>Get a personalized budget breakdown based on your income.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <div className="max-w-sm">
              <FormField
                control={form.control}
                name="monthlySalary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your In-Hand Monthly Salary ({selectedCurrencySymbol})</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 50000" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
          <CardFooter className="flex-col items-stretch gap-4">
            <Button type="submit" className="w-full sm:w-auto">
              Calculate Budget
            </Button>

            {result && (
              <Card className="w-full bg-muted/50">
                <CardHeader>
                    <CardTitle>Your Personalized Budget Plan</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-right w-[100px]">Percentage</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {result.map(item => (
                        <TableRow key={item.category}>
                          <TableCell className="font-medium flex items-center gap-2">
                            <item.icon className="h-4 w-4 text-muted-foreground" />
                            {item.category}
                          </TableCell>
                          <TableCell className="text-right">{selectedCurrencySymbol}{item.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                          <TableCell className="text-right">{item.percentage.toFixed(2)}%</TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="font-bold border-t-2 border-primary">
                          <TableCell>Total</TableCell>
                          <TableCell className="text-right">{selectedCurrencySymbol}{totalCalculated.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                          <TableCell className="text-right">{((totalCalculated/form.getValues("monthlySalary"))*100).toFixed(2)}%</TableCell>
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
