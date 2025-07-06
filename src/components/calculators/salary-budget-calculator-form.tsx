
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
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Info, Target } from "lucide-react";

const salaryBudgetSchema = z.object({
  monthlySalary: z.coerce.number().positive("Monthly salary must be positive."),
  age: z.coerce.number().int().min(18, "Age must be at least 18.").max(100, "Age seems unreasonable."),
  dependents: z.coerce.number().int().min(0, "Dependents cannot be negative."),
  fixedExpenses: z.coerce.number().min(0, "Fixed expenses cannot be negative."),
  currentSavings: z.coerce.number().min(0, "Current savings cannot be negative."),
  financialGoalAmount: z.coerce.number().positive("Financial goal must be positive."),
  financialGoalYears: z.coerce.number().int().min(1, "Goal period must be at least 1 year.").max(50, "Goal period max 50 years."),
  expectedAnnualRaise: z.coerce.number().min(0, "Expected raise cannot be negative.").max(50, "Raise seems too high."),
  expectedAnnualReturn: z.coerce.number().min(0, "Expected return cannot be negative.").max(50, "Return seems too high."),
}).refine(data => data.monthlySalary > data.fixedExpenses, {
  message: "Fixed expenses cannot be greater than your monthly salary.",
  path: ["fixedExpenses"],
});

type SalaryBudgetFormValues = z.infer<typeof salaryBudgetSchema>;

interface YearlyProjectionDetail {
  year: number;
  openingBalance: number;
  totalWithdrawal: number; // Mapped to annual investment for CSV compatibility
  interestEarned: number;
  closingBalance: number;
}

interface SalaryBudgetResult {
  monthlySavings: number;
  savingsRate: number;
  recommendedEmergencyFund: number;
  emergencyFundProgress: number;
  savingsHabit: {
    grade: string;
    variant: "destructive" | "secondary" | "default";
    message: string;
  };
  yearsToGoal: number | null;
  projectedValueInGoalYears: number;
  yearlySchedule: YearlyProjectionDetail[];
}

interface SalaryBudgetCalculatorFormProps {
  calculatorName: string;
  onResultUpdate: (data: Record<string, any> | null) => void;
}

export default function SalaryBudgetCalculatorForm({ calculatorName, onResultUpdate }: SalaryBudgetCalculatorFormProps) {
  const { selectedCurrencySymbol } = useCurrency();
  const [result, setResult] = useState<SalaryBudgetResult | null>(null);

  const form = useForm<SalaryBudgetFormValues>({
    resolver: zodResolver(salaryBudgetSchema),
    defaultValues: {
      monthlySalary: undefined,
      age: 30,
      dependents: 0,
      fixedExpenses: undefined,
      currentSavings: 0,
      financialGoalAmount: 10000000, // 1 Cr
      financialGoalYears: 15,
      expectedAnnualRaise: 5,
      expectedAnnualReturn: 10,
    },
  });

  const formValues = form.watch();
  useEffect(() => {
    setResult(null);
    onResultUpdate(null);
  }, [JSON.stringify(formValues), onResultUpdate]);

  function getSavingsHabit(rate: number) {
    if (rate < 10) return { grade: "Needs Improvement", variant: "destructive", message: "A great first step is to aim for saving at least 10% of your income." };
    if (rate < 20) return { grade: "Good Start", variant: "secondary", message: "You're on the right track! Keep building this habit." };
    if (rate < 30) return { grade: "Excellent", variant: "default", message: "You have a strong savings habit. This will accelerate your wealth-building journey." };
    return { grade: "Superstar Saver", variant: "default", message: "You're a top-tier saver! Your financial future looks incredibly bright." };
  }

  function onSubmit(data: SalaryBudgetFormValues) {
    const { 
      monthlySalary, fixedExpenses, currentSavings, financialGoalAmount, 
      financialGoalYears, expectedAnnualRaise, expectedAnnualReturn 
    } = data;
    
    // Basic Calculations
    const monthlySavings = monthlySalary - fixedExpenses;
    const savingsRate = (monthlySavings / monthlySalary) * 100;
    const recommendedEmergencyFund = fixedExpenses * 6;
    const emergencyFundProgress = recommendedEmergencyFund > 0 ? (currentSavings / recommendedEmergencyFund) * 100 : 100;

    // Savings Habit
    const savingsHabit = getSavingsHabit(savingsRate);

    // Projections
    let annualSavings = monthlySavings * 12;
    const annualReturnRate = expectedAnnualReturn / 100;
    const annualRaiseRate = expectedAnnualRaise / 100;

    // 1. Calculate time to reach goal
    let projectedValueForGoal = currentSavings;
    let annualSavingsForGoal = annualSavings;
    let years = 0;
    let goalReachable = true;
    while(projectedValueForGoal < financialGoalAmount) {
        years++;
        projectedValueForGoal = (projectedValueForGoal + annualSavingsForGoal) * (1 + annualReturnRate);
        annualSavingsForGoal *= (1 + annualRaiseRate);
        if (years > 100) { // Safety break
            goalReachable = false;
            break;
        }
    }

    // 2. Calculate projected value in user-defined years & yearly breakdown
    const yearlySchedule: YearlyProjectionDetail[] = [];
    let projectedValueForSchedule = currentSavings;
    let annualSavingsForSchedule = annualSavings;
    
    for (let year = 1; year <= financialGoalYears; year++) {
      const openingBalance = projectedValueForSchedule;
      const interestEarned = (openingBalance + annualSavingsForSchedule) * annualReturnRate;
      const closingBalance = openingBalance + annualSavingsForSchedule + interestEarned;
      
      yearlySchedule.push({
        year,
        openingBalance,
        totalWithdrawal: annualSavingsForSchedule, // Mapped to annual investment for CSV
        interestEarned,
        closingBalance
      });
      
      projectedValueForSchedule = closingBalance;
      annualSavingsForSchedule *= (1 + annualRaiseRate);
    }

    const resultData: SalaryBudgetResult = {
      monthlySavings,
      savingsRate,
      recommendedEmergencyFund,
      emergencyFundProgress,
      savingsHabit,
      yearsToGoal: goalReachable ? years : null,
      projectedValueInGoalYears: projectedValueForSchedule,
      yearlySchedule,
    };
    setResult(resultData);

    // Prepare data for CSV export
    onResultUpdate({
      summary: {
        "Monthly Salary": monthlySalary,
        "Fixed Expenses": fixedExpenses,
        "Age": data.age,
        "Dependents": data.dependents,
        "Monthly Savings": monthlySavings.toFixed(2),
        "Savings Rate (%)": savingsRate.toFixed(2),
        "Recommended Emergency Fund": recommendedEmergencyFund.toFixed(2),
        "Current Savings": currentSavings,
        "Financial Goal": financialGoalAmount,
        "Years to Reach Goal (Est.)": goalReachable ? years : "Over 100",
        "Projected Value after Goal Period": projectedValueForSchedule.toFixed(2),
      },
      yearlySchedule: yearlySchedule
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{calculatorName}</CardTitle>
        <CardDescription>A tool for middle-class individuals to plan their budget and build wealth.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <h3 className="text-lg font-semibold">Personal & Income Details</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <FormField control={form.control} name="monthlySalary" render={({ field }) => (<FormItem><FormLabel>Monthly Salary (Net, {selectedCurrencySymbol})</FormLabel><FormControl><Input type="number" placeholder="e.g., 50000" {...field} value={field.value ?? ""} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="age" render={({ field }) => (<FormItem><FormLabel>Age</FormLabel><FormControl><Input type="number" placeholder="e.g., 30" {...field} value={field.value ?? ""} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="dependents" render={({ field }) => (<FormItem><FormLabel>Dependents</FormLabel><FormControl><Input type="number" placeholder="e.g., 2" {...field} value={field.value ?? ""} /></FormControl><FormMessage /></FormItem>)} />
            </div>
            
            <h3 className="text-lg font-semibold">Expenses & Savings</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField control={form.control} name="fixedExpenses" render={({ field }) => (<FormItem><FormLabel>Monthly Fixed Expenses ({selectedCurrencySymbol})</FormLabel><FormControl><Input type="number" placeholder="e.g., 20000" {...field} value={field.value ?? ""} /></FormControl><FormDescription>Rent, loans, insurance, etc.</FormDescription><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="currentSavings" render={({ field }) => (<FormItem><FormLabel>Current Savings ({selectedCurrencySymbol})</FormLabel><FormControl><Input type="number" placeholder="e.g., 100000" {...field} value={field.value ?? ""} /></FormControl><FormDescription>Your existing savings/investments.</FormDescription><FormMessage /></FormItem>)} />
            </div>

            <h3 className="text-lg font-semibold">Goals & Projections</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField control={form.control} name="financialGoalAmount" render={({ field }) => (<FormItem><FormLabel>Financial Goal ({selectedCurrencySymbol})</FormLabel><FormControl><Input type="number" placeholder="e.g., 10000000" {...field} value={field.value ?? ""} /></FormControl><FormDescription>e.g., retirement corpus</FormDescription><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="financialGoalYears" render={({ field }) => (<FormItem><FormLabel>Goal Period (Years)</FormLabel><FormControl><Input type="number" placeholder="e.g., 15" {...field} value={field.value ?? ""} /></FormControl><FormDescription>How many years to project?</FormDescription><FormMessage /></FormItem>)} />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField control={form.control} name="expectedAnnualRaise" render={({ field }) => (<FormItem><FormLabel>Expected Annual Raise (%)</FormLabel><FormControl><Input type="number" placeholder="e.g., 5" {...field} value={field.value ?? ""} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="expectedAnnualReturn" render={({ field }) => (<FormItem><FormLabel>Expected Annual Return (%)</FormLabel><FormControl><Input type="number" placeholder="e.g., 10" {...field} value={field.value ?? ""} /></FormControl><FormDescription>On your investments.</FormDescription><FormMessage /></FormItem>)} />
            </div>
          </CardContent>
          <CardFooter className="flex-col items-stretch gap-4">
            <Button type="submit" className="w-full sm:w-auto">Analyze My Budget</Button>
            
            {result && (
              <div className="w-full space-y-6 mt-4">
                <Card className="w-full bg-muted/50">
                  <CardHeader><CardTitle>Your Financial Snapshot</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <Table>
                      <TableBody>
                        <TableRow><TableCell className="font-semibold">Your Monthly Savings</TableCell><TableCell className="text-right font-bold text-emerald-600">{selectedCurrencySymbol}{result.monthlySavings.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell></TableRow>
                        <TableRow><TableCell className="font-semibold">Your Savings Rate</TableCell><TableCell className="text-right"><Badge variant={result.savingsHabit.variant}>{result.savingsRate.toFixed(2)}% ({result.savingsHabit.grade})</Badge></TableCell></TableRow>
                      </TableBody>
                    </Table>
                    <Alert variant="default" className="border-primary/50">
                      <Info className="h-4 w-4" />
                      <AlertTitle>Savings Tip</AlertTitle>
                      <AlertDescription>{result.savingsHabit.message}</AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>

                <Card className="w-full bg-muted/50">
                    <CardHeader><CardTitle>Emergency Fund Status</CardTitle></CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-2">An emergency fund of 6 times your monthly fixed expenses is recommended.</p>
                        <Progress value={result.emergencyFundProgress} className="w-full" />
                        <div className="flex justify-between text-sm mt-2">
                            <span>Current: {selectedCurrencySymbol}{form.getValues('currentSavings').toLocaleString()}</span>
                            <span>Goal: {selectedCurrencySymbol}{result.recommendedEmergencyFund.toLocaleString()}</span>
                        </div>
                        {result.emergencyFundProgress < 100 && (
                            <p className="text-center text-sm mt-3 text-destructive">You have a shortfall of {selectedCurrencySymbol}{(result.recommendedEmergencyFund - form.getValues('currentSavings')).toLocaleString()}. Prioritize building this fund.</p>
                        )}
                    </CardContent>
                </Card>

                <Card className="w-full bg-muted/50">
                    <CardHeader><CardTitle>Goal Projection</CardTitle></CardHeader>
                    <CardContent>
                        <Alert variant="default" className="bg-green-50 dark:bg-green-900/30 border-green-500/50 mb-4">
                            <Target className="h-4 w-4 text-green-700 dark:text-green-300" />
                            <AlertTitle className="text-green-800 dark:text-green-200">Goal: {selectedCurrencySymbol}{form.getValues('financialGoalAmount').toLocaleString()}</AlertTitle>
                            <AlertDescription className="text-green-700 dark:text-green-400">
                                {result.yearsToGoal ? 
                                `Based on your inputs, you are on track to reach your goal in approximately ${result.yearsToGoal} years.` :
                                `At your current rate, reaching this goal will take a very long time. Consider increasing your monthly savings.`
                                }
                            </AlertDescription>
                        </Alert>
                        <p className="text-base">In <span className="font-bold">{form.getValues('financialGoalYears')} years</span>, your total wealth is projected to be:</p>
                        <p className="text-3xl font-bold text-primary text-center my-4">{selectedCurrencySymbol}{result.projectedValueInGoalYears.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                        
                        <CardTitle className="text-xl pt-4 pb-2">Yearly Growth Breakdown</CardTitle>
                        <div className="mt-2 rounded-md border max-h-80 overflow-y-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Year</TableHead>
                                        <TableHead className="text-right">Annual Investment</TableHead>
                                        <TableHead className="text-right">Interest Earned</TableHead>
                                        <TableHead className="text-right">Year-End Value</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {result.yearlySchedule.map(item => (
                                        <TableRow key={item.year}>
                                            <TableCell>{item.year}</TableCell>
                                            <TableCell className="text-right">{selectedCurrencySymbol}{item.totalWithdrawal.toLocaleString(undefined, {minimumFractionDigits: 2})}</TableCell>
                                            <TableCell className="text-right">{selectedCurrencySymbol}{item.interestEarned.toLocaleString(undefined, {minimumFractionDigits: 2})}</TableCell>
                                            <TableCell className="text-right font-semibold">{selectedCurrencySymbol}{item.closingBalance.toLocaleString(undefined, {minimumFractionDigits: 2})}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
              </div>
            )}
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
