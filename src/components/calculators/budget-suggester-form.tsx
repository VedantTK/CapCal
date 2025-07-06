
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
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Home, Lightbulb, Car, UtensilsCrossed, ShieldAlert, Clapperboard, Smartphone, Repeat, ShieldCheck, Wrench, PiggyBank, Trash2, Info, PlusCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const budgetSuggesterSchema = z.object({
  monthlySalary: z.coerce.number().positive("Monthly salary must be positive."),
});

type BudgetSuggesterFormValues = z.infer<typeof budgetSuggesterSchema>;

interface BudgetItem {
  id: string;
  category: string;
  amount: number;
  percentage: number;
  icon: LucideIcon;
  isCustom?: boolean;
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
    { category: 'Miscellaneous', percentage: 0.0411, icon: Wrench },
];

export default function BudgetSuggesterForm({ calculatorName, onResultUpdate }: BudgetSuggesterFormProps) {
  const { selectedCurrencySymbol } = useCurrency();
  const [editableBudget, setEditableBudget] = useState<BudgetItem[] | null>(null);

  const form = useForm<BudgetSuggesterFormValues>({
    resolver: zodResolver(budgetSuggesterSchema),
    defaultValues: {
      monthlySalary: undefined,
    },
  });

  const formValues = form.watch();
  useEffect(() => {
    setEditableBudget(null);
  }, [JSON.stringify(formValues)]);
  
  useEffect(() => {
    const monthlySalary = Number(form.getValues("monthlySalary"));
    if (editableBudget && monthlySalary > 0) {
        const exportData = editableBudget.reduce((acc, item) => {
            acc[item.category] = item.amount.toFixed(2);
            return acc;
        }, {} as Record<string, string>);
        exportData["Total Amount"] = monthlySalary.toFixed(2);
        onResultUpdate(exportData);
    } else {
        onResultUpdate(null);
    }
  }, [editableBudget, form, onResultUpdate]);

  function onSubmit(data: BudgetSuggesterFormValues) {
    const { monthlySalary } = data;
    let runningTotal = 0;

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
    
    const resultData: BudgetItem[] = calculatedItems.map((item, index) => ({
        ...item,
        id: item.category.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-'),
        percentage: (item.amount / monthlySalary) * 100,
        isCustom: false,
    }));

    setEditableBudget(resultData);
  }

  const handleAmountChange = (id: string, value: string) => {
      const newAmount = parseFloat(value) || 0;
      const monthlySalary = Number(form.getValues("monthlySalary"));
      if (!monthlySalary || monthlySalary <= 0) return;

      setEditableBudget(prev => 
          prev!.map(item => 
              item.id === id
              ? { ...item, amount: newAmount, percentage: (newAmount / monthlySalary) * 100 } 
              : item
          )
      );
  };
  
  const handleCategoryNameChange = (id: string, newName: string) => {
    setEditableBudget(prev => 
      prev!.map(item => 
        item.id === id ? { ...item, category: newName } : item
      )
    );
  };

  const handleAddCategory = () => {
    const newCategory: BudgetItem = {
      id: `custom-${Date.now()}`,
      category: 'New Category',
      amount: 0,
      percentage: 0,
      icon: Wrench,
      isCustom: true,
    };
    setEditableBudget(prev => prev ? [...prev, newCategory] : [newCategory]);
  };

  const handleRemoveCategory = (id: string) => {
      setEditableBudget(prev => prev!.filter(item => item.id !== id));
  };
  
  const monthlySalary = Number(form.getValues("monthlySalary")) || 0;
  const totalAllocated = editableBudget?.reduce((sum, item) => sum + item.amount, 0) ?? 0;
  const unallocatedAmount = monthlySalary - totalAllocated;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{calculatorName}</CardTitle>
        <CardDescription>Get a personalized budget breakdown based on your income, then adjust it to fit your needs.</CardDescription>
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

            {editableBudget && (
              <Card className="w-full bg-muted/50">
                <CardHeader>
                    <CardTitle>Your Personalized Budget Plan</CardTitle>
                    <CardDescription>This is a starting point. Feel free to edit amounts or remove categories to match your lifestyle.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Category</TableHead>
                          <TableHead className="w-[150px]">Amount</TableHead>
                          <TableHead className="text-right w-[100px]">Percentage</TableHead>
                          <TableHead className="text-right w-[60px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {editableBudget.map(item => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium flex items-center gap-2">
                              <item.icon className="h-4 w-4 text-muted-foreground" />
                              {item.isCustom ? (
                                <Input
                                  type="text"
                                  value={item.category}
                                  onChange={(e) => handleCategoryNameChange(item.id, e.target.value)}
                                  className="h-8 border-dashed"
                                />
                              ) : (
                                item.category
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <span className="mr-1 text-muted-foreground">{selectedCurrencySymbol}</span>
                                <Input 
                                  type="number" 
                                  value={item.amount.toFixed(2)}
                                  onChange={(e) => handleAmountChange(item.id, e.target.value)}
                                  className="h-8"
                                />
                              </div>
                            </TableCell>
                            <TableCell className="text-right">{item.percentage.toFixed(2)}%</TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="icon" onClick={() => handleRemoveCategory(item.id)} className="h-8 w-8">
                                <Trash2 className="h-4 w-4 text-destructive" />
                                <span className="sr-only">Remove {item.category}</span>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow className="font-bold border-t-2 border-primary">
                            <TableCell>Total Allocated</TableCell>
                            <TableCell className="text-right" colSpan={2}>{selectedCurrencySymbol}{totalAllocated.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                            <TableCell />
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                  
                  <Button variant="outline" onClick={handleAddCategory} className="w-full sm:w-auto">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Category
                  </Button>

                  <Alert variant={Math.abs(unallocatedAmount) > 0.01 ? (unallocatedAmount > 0 ? 'default' : 'destructive') : 'default'} className={cn(unallocatedAmount > 0.01 && "border-blue-500/50 bg-blue-50 dark:bg-blue-900/30")}>
                    <Info className="h-4 w-4" />
                    <AlertTitle>
                        {unallocatedAmount > 0.01 && `Unallocated Funds: ${selectedCurrencySymbol}${unallocatedAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`}
                        {unallocatedAmount < -0.01 && `Over-allocated by: ${selectedCurrencySymbol}${Math.abs(unallocatedAmount).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`}
                        {Math.abs(unallocatedAmount) <= 0.01 && "All Funds Allocated"}
                    </AlertTitle>
                    <AlertDescription>
                        {unallocatedAmount > 0.01 && "You have money left to assign. Consider putting it towards your investments or savings!"}
                        {unallocatedAmount < -0.01 && "Your budget exceeds your salary. Please adjust the amounts."}
                        {Math.abs(unallocatedAmount) <= 0.01 && "Great job! Your budget matches your salary."}
                    </AlertDescription>
                  </Alert>

                </CardContent>
              </Card>
            )}
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
