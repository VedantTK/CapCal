
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowDown, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";


const homeLoanEmiSchema = z.object({
  loanAmount: z.coerce.number().positive("Loan amount must be positive."),
  annualInterestRate: z.coerce.number().min(0, "Interest rate cannot be negative.").max(100, "Interest rate seems too high."),
  loanTenureYears: z.coerce.number().int().min(1, "Loan tenure must be at least 1 year.").max(50, "Loan tenure max 50 years."),
  prepaymentType: z.enum(['extra', 'extra_emi', 'increase']).optional(),
  extraEmiPerYear: z.coerce.number().min(0, "Extra payment cannot be negative.").optional(),
  numberOfExtraEmis: z.coerce.number().int().min(1, "Must be at least 1").max(100, "Cannot be more than 100").optional(),
  emiIncreasePercentage: z.coerce.number().min(0, "Increase cannot be negative.").max(50, "Increase seems too high.").optional(),
}).superRefine((data, ctx) => {
  if (data.prepaymentType === 'extra' && (data.extraEmiPerYear === undefined || data.extraEmiPerYear <= 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Extra payment amount is required and must be positive.",
      path: ["extraEmiPerYear"],
    });
  }
   if (data.prepaymentType === 'extra_emi' && (data.numberOfExtraEmis === undefined || data.numberOfExtraEmis <= 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Number of extra EMIs is required and must be a positive number.",
      path: ["numberOfExtraEmis"],
    });
  }
  if (data.prepaymentType === 'increase' && (data.emiIncreasePercentage === undefined || data.emiIncreasePercentage <= 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "EMI increase percentage is required and must be positive.",
      path: ["emiIncreasePercentage"],
    });
  }
});


type HomeLoanEmiFormValues = z.infer<typeof homeLoanEmiSchema>;

interface MonthlyAmortizationDetail {
  month: number;
  principal: number;
  interest: number;
  totalPayment: number;
  endingBalance: number;
}

interface YearlyAmortizationDetail {
  year: number;
  principal: number;
  interest: number;
  endingBalance: number;
}

interface EmiResult {
  monthlyEmi: number;
  totalInterest: number;
  totalPayment: number;
  monthlySchedule: MonthlyAmortizationDetail[];
  yearlySchedule: YearlyAmortizationDetail[];
}

interface SavingsResult {
  newTotalInterest: number;
  newTotalPayment: number;
  newTenureMonths: number;
  interestSaved: number;
  timeSavedMonths: number;
  newMonthlySchedule: MonthlyAmortizationDetail[];
  newYearlySchedule: YearlyAmortizationDetail[];
}

interface HomeLoanEmiCalculatorFormProps {
  calculatorName: string;
  onResultUpdate: (data: Record<string, any> | null) => void;
}

export default function HomeLoanEmiCalculatorForm({ calculatorName, onResultUpdate }: HomeLoanEmiCalculatorFormProps) {
  const { selectedCurrencySymbol } = useCurrency();
  const [result, setResult] = useState<EmiResult | null>(null);
  const [savingsResult, setSavingsResult] = useState<SavingsResult | null>(null);
  const [showSavingsOptions, setShowSavingsOptions] = useState(false);

  const form = useForm<HomeLoanEmiFormValues>({
    resolver: zodResolver(homeLoanEmiSchema),
    defaultValues: {
      loanAmount: undefined,
      annualInterestRate: 8.5,
      loanTenureYears: 20,
      prepaymentType: undefined,
      extraEmiPerYear: undefined,
      numberOfExtraEmis: 1,
      emiIncreasePercentage: undefined,
    },
    mode: 'onChange'
  });

  const [loanAmount, annualInterestRate, loanTenureYears] = form.watch(['loanAmount', 'annualInterestRate', 'loanTenureYears']);
  useEffect(() => {
    setResult(null);
    setSavingsResult(null);
    onResultUpdate(null);
  }, [loanAmount, annualInterestRate, loanTenureYears, onResultUpdate]);

  function onSubmit(data: HomeLoanEmiFormValues) {
    setSavingsResult(null); // Clear previous savings calculation
    setShowSavingsOptions(false); // Hide savings form on new base calculation
    form.setValue('prepaymentType', undefined); // Reset radio button
    form.setValue('extraEmiPerYear', undefined); // Reset extra payment
    form.setValue('numberOfExtraEmis', 1);
    form.setValue('emiIncreasePercentage', undefined); // Reset percentage increase

    const principal = data.loanAmount;
    const annualRate = data.annualInterestRate / 100;
    const monthlyRate = annualRate / 12;
    const numberOfMonths = data.loanTenureYears * 12;

    let emi: number, totalPayment: number, totalInterest: number;
    
    if (monthlyRate === 0) {
      emi = principal / numberOfMonths;
      totalPayment = principal;
      totalInterest = 0;
    } else {
      emi = principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfMonths) / (Math.pow(1 + monthlyRate, numberOfMonths) - 1);
      totalPayment = emi * numberOfMonths;
      totalInterest = totalPayment - principal;
    }

    const { monthlySchedule, yearlySchedule } = generateAmortizationSchedules(principal, emi, monthlyRate, numberOfMonths);

    const resultData = { monthlyEmi: emi, totalInterest, totalPayment, monthlySchedule, yearlySchedule };
    setResult(resultData);

    onResultUpdate({
      summary: {
        "Loan Amount": principal,
        "Annual Interest Rate (%)": data.annualInterestRate,
        "Loan Tenure (Years)": data.loanTenureYears,
        "Monthly EMI": emi.toFixed(2),
        "Total Interest Payable": totalInterest.toFixed(2),
        "Total Payment (Principal + Interest)": totalPayment.toFixed(2),
      },
      yearlySchedule,
      monthlySchedule,
    });
  }

  function handleSavingsCalculation() {
    form.trigger(['prepaymentType', 'extraEmiPerYear', 'numberOfExtraEmis', 'emiIncreasePercentage']);
    const { prepaymentType, extraEmiPerYear, numberOfExtraEmis, emiIncreasePercentage, annualInterestRate } = form.getValues();
    const formErrors = form.formState.errors;

    if (!result || !prepaymentType || (prepaymentType === 'extra' && formErrors.extraEmiPerYear) || (prepaymentType === 'extra_emi' && formErrors.numberOfExtraEmis) || (prepaymentType === 'increase' && formErrors.emiIncreasePercentage)) {
        return;
    }
    
    const loanAmountValue = Number(form.getValues().loanAmount);
    let balance = loanAmountValue;
    const monthlyRate = annualInterestRate / 100 / 12;
    let currentEmi = result.monthlyEmi;

    let months = 0;
    let newTotalInterestPaid = 0;
    
    const newMonthlySchedule: MonthlyAmortizationDetail[] = [];
    const newYearlySchedule: YearlyAmortizationDetail[] = [];
    let yearlyPrincipal = 0;
    let yearlyInterest = 0;

    while (balance > 0) {
      months++;
      const interestForMonth = balance * monthlyRate;
      newTotalInterestPaid += interestForMonth;

      let principalPaid = currentEmi - interestForMonth;
      if (balance < currentEmi) { // Final payment
        principalPaid = balance;
        currentEmi = balance + interestForMonth;
      }
      
      balance -= principalPaid;

      newMonthlySchedule.push({
          month: months,
          principal: principalPaid,
          interest: interestForMonth,
          totalPayment: currentEmi,
          endingBalance: balance,
      });

      yearlyPrincipal += principalPaid;
      yearlyInterest += interestForMonth;

      if (months % 12 === 0) {
        if (prepaymentType === 'extra' && extraEmiPerYear) {
            const extraPrincipalPaid = Math.min(balance, extraEmiPerYear);
            balance -= extraPrincipalPaid;
            yearlyPrincipal += extraPrincipalPaid;
        } else if (prepaymentType === 'extra_emi' && result.monthlyEmi && numberOfExtraEmis) {
            const extraPayment = result.monthlyEmi * numberOfExtraEmis;
            const extraPrincipalPaid = Math.min(balance, extraPayment);
            balance -= extraPrincipalPaid;
            yearlyPrincipal += extraPrincipalPaid;
        } else if (prepaymentType === 'increase' && emiIncreasePercentage) {
          currentEmi *= (1 + emiIncreasePercentage / 100);
        }

        newYearlySchedule.push({
            year: Math.ceil(months / 12),
            principal: yearlyPrincipal,
            interest: yearlyInterest,
            endingBalance: balance
        });
        yearlyPrincipal = 0;
        yearlyInterest = 0;
      }
    }
    // Add last partial year if any
    if (months % 12 !== 0) {
        newYearlySchedule.push({
            year: Math.ceil(months / 12),
            principal: yearlyPrincipal,
            interest: yearlyInterest,
            endingBalance: balance,
        });
    }

    const newTotalPayment = loanAmountValue + newTotalInterestPaid;
    const interestSaved = result.totalInterest - newTotalInterestPaid;
    const timeSavedMonths = (form.getValues().loanTenureYears * 12) - months;

    const savingsData = {
      newTotalInterest: newTotalInterestPaid,
      newTotalPayment,
      newTenureMonths: months,
      interestSaved,
      timeSavedMonths,
      newMonthlySchedule,
      newYearlySchedule,
    };
    setSavingsResult(savingsData);

    onResultUpdate({
      summary: {
        "Loan Amount": loanAmountValue,
        "Annual Interest Rate (%)": annualInterestRate,
        "Loan Tenure (Years)": form.getValues().loanTenureYears,
        "Monthly EMI": result.monthlyEmi.toFixed(2),
        "Total Interest Payable": result.totalInterest.toFixed(2),
        "Total Payment (Principal + Interest)": result.totalPayment.toFixed(2),
      },
      savingsSummary: {
        "New Loan Tenure": `${Math.floor(months / 12)} years, ${months % 12} months`,
        "New Total Interest Payable": newTotalInterestPaid.toFixed(2),
        "New Total Payment": newTotalPayment.toFixed(2),
      },
      savingsDetails: {
        "Interest Saved": interestSaved.toFixed(2),
        "Time Saved": `${Math.floor(timeSavedMonths / 12)} years, ${timeSavedMonths % 12} months`,
      },
      newMonthlySchedule,
      newYearlySchedule,
    });
  }

  function generateAmortizationSchedules(principal: number, emi: number, monthlyRate: number, numberOfMonths: number) {
      const monthlySchedule: MonthlyAmortizationDetail[] = [];
      const yearlySchedule: YearlyAmortizationDetail[] = [];
      let beginningBalance = principal;
      let yearlyPrincipal = 0;
      let yearlyInterest = 0;

      for (let i = 1; i <= numberOfMonths; i++) {
        const interestPayment = beginningBalance * monthlyRate;
        const principalPayment = emi - interestPayment;
        const endingBalance = beginningBalance - principalPayment;

        monthlySchedule.push({
          month: i,
          principal: principalPayment,
          interest: interestPayment,
          totalPayment: emi,
          endingBalance: endingBalance,
        });

        yearlyPrincipal += principalPayment;
        yearlyInterest += interestPayment;

        if (i % 12 === 0 || i === numberOfMonths) {
          yearlySchedule.push({
            year: Math.ceil(i / 12),
            principal: yearlyPrincipal,
            interest: yearlyInterest,
            endingBalance: endingBalance,
          });
          yearlyPrincipal = 0;
          yearlyInterest = 0;
        }
        
        beginningBalance = endingBalance;
      }
      return { monthlySchedule, yearlySchedule };
  }
  
  const tenureOptions = Array.from({ length: 30 }, (_, i) => i + 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{calculatorName}</CardTitle>
        <CardDescription>Calculate your Home Loan EMI, see the full amortization schedule, and explore how prepayments can save you money.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <FormField
                control={form.control}
                name="loanAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loan Amount ({selectedCurrencySymbol})</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 5000000" {...field} onChange={e => { field.onChange(e); setSavingsResult(null); setShowSavingsOptions(false); }} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="annualInterestRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Annual Interest Rate (%)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 8.5" {...field} onChange={e => { field.onChange(e); setSavingsResult(null); setShowSavingsOptions(false); }} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="loanTenureYears"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loan Tenure (Years)</FormLabel>
                     <Select onValueChange={(value) => { field.onChange(Number(value)); setSavingsResult(null); setShowSavingsOptions(false); }} defaultValue={String(field.value)}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select tenure" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {tenureOptions.map(year => (
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
          <CardFooter className="flex-col items-start gap-4">
            <div className="flex w-full flex-wrap items-center gap-4">
              <Button type="submit" className="w-full sm:w-auto">Calculate Home Loan EMI</Button>
              {result && (
                <Button type="button" variant="outline" onClick={() => setShowSavingsOptions(s => !s)} className="w-full sm:w-auto">
                  How to save money? <ChevronsUpDown className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>

            {showSavingsOptions && result && (
              <Card className="w-full mt-4 bg-muted/30">
                <CardHeader>
                  <CardTitle>Prepayment Options</CardTitle>
                  <CardDescription>Choose one method to see how you can save on your loan.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="prepaymentType"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col gap-4"
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="extra" />
                              </FormControl>
                              <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                                <FormLabel className="font-normal">Pay an extra amount per year</FormLabel>
                                <FormField
                                  control={form.control}
                                  name="extraEmiPerYear"
                                  render={({ field: f }) => (
                                    <FormItem>
                                      <FormControl>
                                        <Input type="number" placeholder={`e.g., ${result.monthlyEmi.toFixed(0)}`} {...f} disabled={field.value !== 'extra'} value={f.value ?? ""} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="extra_emi" />
                              </FormControl>
                              <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                                <FormLabel className="font-normal">
                                  Pay extra EMI(s) per year
                                </FormLabel>
                                <FormField
                                  control={form.control}
                                  name="numberOfExtraEmis"
                                  render={({ field: f }) => (
                                    <FormItem>
                                      <FormControl>
                                        <Input
                                          type="number"
                                          placeholder="e.g., 1"
                                          {...f}
                                          disabled={field.value !== 'extra_emi'}
                                          value={f.value ?? ''}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="increase" />
                              </FormControl>
                              <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                                <FormLabel className="font-normal">Increase EMI every year by (%)</FormLabel>
                                <FormField
                                  control={form.control}
                                  name="emiIncreasePercentage"
                                  render={({ field: f }) => (
                                    <FormItem>
                                      <FormControl>
                                         <Input type="number" placeholder="e.g., 5" {...f} disabled={field.value !== 'increase'} value={f.value ?? ""} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter>
                  <Button type="button" onClick={handleSavingsCalculation}>Recalculate with Savings</Button>
                </CardFooter>
              </Card>
            )}

            {result && !savingsResult && (
              <Card className="w-full bg-muted/50 mt-4">
                <CardHeader>
                  <CardTitle>Loan Repayment Details</CardTitle>
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
                        <TableCell className="font-semibold">Monthly EMI</TableCell>
                        <TableCell className="text-right font-bold">{selectedCurrencySymbol}{result.monthlyEmi.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Total Interest Payable</TableCell>
                        <TableCell className="text-right">{selectedCurrencySymbol}{result.totalInterest.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Total Payment (Principal + Interest)</TableCell>
                        <TableCell className="text-right">{selectedCurrencySymbol}{result.totalPayment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>

                  <Tabs defaultValue="yearly" className="w-full mt-6">
                    <TabsList className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
                      <TabsTrigger value="yearly">Yearly Breakdown</TabsTrigger>
                      <TabsTrigger value="monthly">Monthly Breakdown</TabsTrigger>
                    </TabsList>
                    <TabsContent value="yearly">
                      <Card>
                        <CardHeader><CardTitle>Yearly Amortization Schedule</CardTitle></CardHeader>
                        <CardContent>
                           {/* Mobile View */}
                           <div className="md:hidden">
                                {result.yearlySchedule.map((row) => (
                                    <div key={row.year} className="border-b p-4 space-y-2">
                                        <div className="flex justify-between items-center"><span className="font-semibold text-muted-foreground">Year</span><span className="font-medium">{row.year}</span></div>
                                        <div className="flex justify-between items-center"><span className="font-semibold text-muted-foreground">Principal Paid</span><span className="font-medium">{selectedCurrencySymbol}{row.principal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
                                        <div className="flex justify-between items-center"><span className="font-semibold text-muted-foreground">Interest Paid</span><span className="font-medium">{selectedCurrencySymbol}{row.interest.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
                                        <div className="flex justify-between items-center"><span className="font-semibold text-muted-foreground">Ending Balance</span><span className="font-medium">{selectedCurrencySymbol}{row.endingBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
                                    </div>
                                ))}
                            </div>

                            {/* Desktop View */}
                            <div className="hidden md:block overflow-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[100px]">Year</TableHead>
                                            <TableHead className="text-right">Principal Paid</TableHead>
                                            <TableHead className="text-right">Interest Paid</TableHead>
                                            <TableHead className="text-right">Ending Balance</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {result.yearlySchedule.map((row) => (
                                            <TableRow key={row.year}>
                                                <TableCell>{row.year}</TableCell>
                                                <TableCell className="text-right">{selectedCurrencySymbol}{row.principal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                <TableCell className="text-right">{selectedCurrencySymbol}{row.interest.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                <TableCell className="text-right">{selectedCurrencySymbol}{row.endingBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                    <TabsContent value="monthly">
                        <Card>
                            <CardHeader><CardTitle>Monthly Amortization Schedule</CardTitle></CardHeader>
                            <CardContent>
                               {/* Mobile View */}
                               <div className="md:hidden">
                                    {result.monthlySchedule.map((row) => (
                                        <div key={row.month} className="border-b p-4 space-y-2">
                                            <div className="flex justify-between items-center"><span className="font-semibold text-muted-foreground">Month</span><span className="font-medium">{row.month}</span></div>
                                            <div className="flex justify-between items-center"><span className="font-semibold text-muted-foreground">Principal Paid</span><span className="font-medium">{selectedCurrencySymbol}{row.principal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
                                            <div className="flex justify-between items-center"><span className="font-semibold text-muted-foreground">Interest Paid</span><span className="font-medium">{selectedCurrencySymbol}{row.interest.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
                                            <div className="flex justify-between items-center"><span className="font-semibold text-muted-foreground">Total Payment</span><span className="font-medium">{selectedCurrencySymbol}{row.totalPayment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
                                            <div className="flex justify-between items-center"><span className="font-semibold text-muted-foreground">Ending Balance</span><span className="font-medium">{selectedCurrencySymbol}{row.endingBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
                                        </div>
                                    ))}
                                </div>

                                {/* Desktop View */}
                                <div className="hidden md:block overflow-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-[80px]">Month</TableHead>
                                                <TableHead className="text-right">Principal Paid</TableHead>
                                                <TableHead className="text-right">Interest Paid</TableHead>
                                                <TableHead className="text-right">Total Payment</TableHead>
                                                <TableHead className="text-right">Ending Balance</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {result.monthlySchedule.map((row) => (
                                                <TableRow key={row.month}>
                                                    <TableCell>{row.month}</TableCell>
                                                    <TableCell className="text-right">{selectedCurrencySymbol}{row.principal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                    <TableCell className="text-right">{selectedCurrencySymbol}{row.interest.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                    <TableCell className="text-right">{selectedCurrencySymbol}{row.totalPayment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                    <TableCell className="text-right">{selectedCurrencySymbol}{row.endingBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )}

            {result && savingsResult && (
               <Card className="w-full bg-muted/50 mt-4">
                <CardHeader>
                  <CardTitle>Loan Comparison & Savings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                        {/* Without Prepayment */}
                        <div className="space-y-2">
                            <h3 className="font-semibold text-lg">Without Prepayment</h3>
                            <Table>
                                <TableBody>
                                    <TableRow><TableCell>Monthly EMI</TableCell><TableCell className="text-right">{selectedCurrencySymbol}{result.monthlyEmi.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell></TableRow>
                                    <TableRow><TableCell>Loan Tenure</TableCell><TableCell className="text-right">{form.getValues().loanTenureYears} Years</TableCell></TableRow>
                                    <TableRow><TableCell>Total Interest</TableCell><TableCell className="text-right">{selectedCurrencySymbol}{result.totalInterest.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell></TableRow>
                                    <TableRow><TableCell>Total Payment</TableCell><TableCell className="text-right">{selectedCurrencySymbol}{result.totalPayment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell></TableRow>
                                </TableBody>
                            </Table>
                        </div>
                        {/* With Prepayment */}
                        <div className="space-y-2">
                            <h3 className="font-semibold text-lg">With Prepayment</h3>
                            <Table>
                                <TableBody>
                                    <TableRow><TableCell>New Loan Tenure</TableCell><TableCell className="text-right">{Math.floor(savingsResult.newTenureMonths / 12)} Yrs, {savingsResult.newTenureMonths % 12} Mos</TableCell></TableRow>
                                    <TableRow><TableCell>New Total Interest</TableCell><TableCell className="text-right">{selectedCurrencySymbol}{savingsResult.newTotalInterest.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell></TableRow>
                                    <TableRow><TableCell>New Total Payment</TableCell><TableCell className="text-right">{selectedCurrencySymbol}{savingsResult.newTotalPayment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell></TableRow>
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                    <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-900/30">
                        <h3 className="font-bold text-xl text-green-700 dark:text-green-300">Your Total Savings</h3>
                        <div className="flex flex-col gap-4 sm:flex-row sm:justify-around items-center mt-2">
                            <div>
                                <p className="text-sm text-muted-foreground">Interest Saved</p>
                                <p className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">{selectedCurrencySymbol}{savingsResult.interestSaved.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                            </div>
                             <div>
                                <p className="text-sm text-muted-foreground">Time Saved</p>
                                <p className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">{Math.floor(savingsResult.timeSavedMonths / 12)} Yrs, {savingsResult.timeSavedMonths % 12} Mos</p>
                            </div>
                        </div>
                    </div>
                    
                    <Tabs defaultValue="yearly" className="w-full mt-6">
                        <TabsList className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2"><TabsTrigger value="yearly">New Yearly Breakdown</TabsTrigger><TabsTrigger value="monthly">New Monthly Breakdown</TabsTrigger></TabsList>
                        <TabsContent value="yearly">
                            <Card>
                                <CardHeader><CardTitle>New Yearly Amortization Schedule</CardTitle></CardHeader>
                                <CardContent>
                                    {/* Mobile View */}
                                    <div className="md:hidden">
                                        {savingsResult.newYearlySchedule.map((row) => (
                                            <div key={row.year} className="border-b p-4 space-y-2">
                                                <div className="flex justify-between items-center"><span className="font-semibold text-muted-foreground">Year</span><span className="font-medium">{row.year}</span></div>
                                                <div className="flex justify-between items-center"><span className="font-semibold text-muted-foreground">Principal</span><span className="font-medium">{selectedCurrencySymbol}{row.principal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
                                                <div className="flex justify-between items-center"><span className="font-semibold text-muted-foreground">Interest</span><span className="font-medium">{selectedCurrencySymbol}{row.interest.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
                                                <div className="flex justify-between items-center"><span className="font-semibold text-muted-foreground">Ending Balance</span><span className="font-medium">{selectedCurrencySymbol}{row.endingBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
                                            </div>
                                        ))}
                                    </div>
                                    {/* Desktop View */}
                                    <div className="hidden md:block overflow-auto">
                                        <Table>
                                            <TableHeader><TableRow><TableHead>Year</TableHead><TableHead className="text-right">Principal</TableHead><TableHead className="text-right">Interest</TableHead><TableHead className="text-right">Ending Balance</TableHead></TableRow></TableHeader>
                                            <TableBody>
                                                {savingsResult.newYearlySchedule.map((row) => (
                                                    <TableRow key={row.year}><TableCell>{row.year}</TableCell><TableCell className="text-right">{selectedCurrencySymbol}{row.principal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell><TableCell className="text-right">{selectedCurrencySymbol}{row.interest.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell><TableCell className="text-right">{selectedCurrencySymbol}{row.endingBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell></TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                         <TabsContent value="monthly">
                            <Card>
                                <CardHeader><CardTitle>New Monthly Amortization Schedule</CardTitle></CardHeader>
                                <CardContent>
                                    {/* Mobile View */}
                                    <div className="md:hidden">
                                        {savingsResult.newMonthlySchedule.map((row) => (
                                            <div key={row.month} className="border-b p-4 space-y-2">
                                                <div className="flex justify-between items-center"><span className="font-semibold text-muted-foreground">Month</span><span className="font-medium">{row.month}</span></div>
                                                <div className="flex justify-between items-center"><span className="font-semibold text-muted-foreground">Principal</span><span className="font-medium">{selectedCurrencySymbol}{row.principal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
                                                <div className="flex justify-between items-center"><span className="font-semibold text-muted-foreground">Interest</span><span className="font-medium">{selectedCurrencySymbol}{row.interest.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
                                                <div className="flex justify-between items-center"><span className="font-semibold text-muted-foreground">Total Payment</span><span className="font-medium">{selectedCurrencySymbol}{row.totalPayment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
                                                <div className="flex justify-between items-center"><span className="font-semibold text-muted-foreground">Ending Balance</span><span className="font-medium">{selectedCurrencySymbol}{row.endingBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
                                            </div>
                                        ))}
                                    </div>
                                    {/* Desktop View */}
                                    <div className="hidden md:block overflow-auto">
                                        <Table>
                                            <TableHeader><TableRow><TableHead>Month</TableHead><TableHead className="text-right">Principal</TableHead><TableHead className="text-right">Interest</TableHead><TableHead className="text-right">Total Payment</TableHead><TableHead className="text-right">Ending Balance</TableHead></TableRow></TableHeader>
                                            <TableBody>
                                                {savingsResult.newMonthlySchedule.map((row) => (
                                                    <TableRow key={row.month}><TableCell>{row.month}</TableCell><TableCell className="text-right">{selectedCurrencySymbol}{row.principal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell><TableCell className="text-right">{selectedCurrencySymbol}{row.interest.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell><TableCell className="text-right">{selectedCurrencySymbol}{row.totalPayment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell><TableCell className="text-right">{selectedCurrencySymbol}{row.endingBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell></TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </CardContent>
              </Card>
            )}
            
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
