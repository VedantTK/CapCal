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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { suggestBudget, type SuggestBudgetOutput } from "@/ai/flows/suggest-budget-flow";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, icons } from "lucide-react";
import type { LucideProps } from 'lucide-react';
import { Skeleton } from "../ui/skeleton";

const budgetSuggesterSchema = z.object({
  monthlySalary: z.coerce.number().positive("Monthly salary must be positive."),
  dependents: z.coerce.number().int().min(0, "Dependents cannot be negative.").optional(),
});

type BudgetSuggesterFormValues = z.infer<typeof budgetSuggesterSchema>;

interface BudgetSuggesterFormProps {
  calculatorName: string;
  onResultUpdate: (data: Record<string, any> | null) => void;
}

const LucideIcon = ({ name, ...props }: { name: string } & LucideProps) => {
    const Icon = icons[name as keyof typeof icons];
    if (!Icon) {
        return null; // or a default icon
    }
    return <Icon {...props} />;
};


export default function BudgetSuggesterForm({ calculatorName, onResultUpdate }: BudgetSuggesterFormProps) {
  const { selectedCurrencySymbol } = useCurrency();
  const [result, setResult] = useState<SuggestBudgetOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<BudgetSuggesterFormValues>({
    resolver: zodResolver(budgetSuggesterSchema),
    defaultValues: {
      monthlySalary: undefined,
      dependents: 0,
    },
  });

  const formValues = form.watch();
  useEffect(() => {
    setResult(null);
    setError(null);
    onResultUpdate(null);
  }, [JSON.stringify(formValues), onResultUpdate]);

  async function onSubmit(data: BudgetSuggesterFormValues) {
    setIsLoading(true);
    setResult(null);
    setError(null);
    onResultUpdate(null);

    try {
      const response = await suggestBudget({
        monthlySalary: data.monthlySalary,
        currencySymbol: selectedCurrencySymbol,
        dependents: data.dependents ?? 0,
      });

      if (response && response.budgetItems) {
        setResult(response);
        // Prepare data for CSV export
        const exportData = response.budgetItems.reduce((acc, item) => {
            acc[item.category] = item.amount.toFixed(2);
            return acc;
        }, {} as Record<string, string>);
        
        const totalAmount = response.budgetItems.reduce((sum, item) => sum + item.amount, 0);
        exportData["Total Amount"] = totalAmount.toFixed(2);
        exportData["AI Summary"] = response.summary;
        
        onResultUpdate(exportData);
      } else {
         setError("The AI could not generate a budget. Please try again.");
      }
    } catch (e) {
      console.error(e);
      setError("An error occurred while generating the budget. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }

  const totalCalculated = result?.budgetItems.reduce((sum, item) => sum + item.amount, 0) ?? 0;
  const totalInput = form.getValues("monthlySalary") || 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{calculatorName}</CardTitle>
        <CardDescription>Get a personalized budget breakdown based on your income, powered by AI.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
               <FormField
                control={form.control}
                name="dependents"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Dependents</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 0" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
          <CardFooter className="flex-col items-stretch gap-4">
            <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? "Generating Budget..." : "Suggest My Budget"}
            </Button>
            
            {isLoading && (
              <Card className="w-full bg-muted/50">
                <CardHeader><CardTitle>AI is drafting your budget...</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-[90%]" />
                    <Skeleton className="h-8 w-[95%]" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-[85%]" />
                </CardContent>
              </Card>
            )}

            {error && (
                <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {result && (
              <Card className="w-full bg-muted/50">
                <CardHeader>
                    <CardTitle>Your Personalized Budget Plan</CardTitle>
                    <CardDescription>{result.summary}</CardDescription>
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
                      {result.budgetItems.map(item => (
                        <TableRow key={item.category}>
                          <TableCell className="font-medium flex items-center gap-2">
                            {item.icon && <LucideIcon name={item.icon} className="h-4 w-4 text-muted-foreground" />}
                            {item.category}
                          </TableCell>
                          <TableCell className="text-right">{selectedCurrencySymbol}{item.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                          <TableCell className="text-right">{((item.amount / totalInput) * 100).toFixed(1)}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                    <TableRow className="font-bold border-t-2 border-primary">
                        <TableCell>Total</TableCell>
                        <TableCell className="text-right">{selectedCurrencySymbol}{totalCalculated.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                        <TableCell className="text-right">{((totalCalculated/totalInput)*100).toFixed(1)}%</TableCell>
                    </TableRow>
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
