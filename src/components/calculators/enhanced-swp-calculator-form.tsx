"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useState } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingDown, Calculator, Target, DollarSign, Wallet } from "lucide-react";
import { useCurrency } from "@/contexts/currency-context";
import { calculateSWP, type MutualFund } from "@/lib/mutual-funds";
import MutualFundSelector from "@/components/mutual-fund-selector";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

const swpSchema = z.object({
  initialAmount: z.coerce.number().positive("Initial amount must be positive"),
  monthlyWithdrawal: z.coerce.number().positive("Monthly withdrawal must be positive"),
  duration: z.coerce.number().int().min(1, "Duration must be at least 1 year").max(50, "Duration max 50 years"),
  expectedReturn: z.coerce.number().min(0, "Return rate cannot be negative").max(50, "Return rate seems too high"),
});

type SwpFormValues = z.infer<typeof swpSchema>;

interface SwpResult {
  totalWithdrawn: number;
  remainingBalance: number;
  monthlyData: Array<{month: number, balance: number, withdrawn: number}>;
  yearlyData: Array<{year: number, balance: number, totalWithdrawn: number}>;
}

interface EnhancedSwpCalculatorFormProps {
  calculatorName: string;
}

export default function EnhancedSwpCalculatorForm({ calculatorName }: EnhancedSwpCalculatorFormProps) {
  const { selectedCurrencySymbol } = useCurrency();
  const [result, setResult] = useState<SwpResult | null>(null);
  const [selectedFund, setSelectedFund] = useState<MutualFund | null>(null);

  const form = useForm<SwpFormValues>({
    resolver: zodResolver(swpSchema),
    defaultValues: {
      initialAmount: undefined,
      monthlyWithdrawal: undefined,
      duration: 10,
      expectedReturn: 8,
    },
  });

  const expectedReturn = form.watch("expectedReturn");

  const handleExpectedReturnChange = (returnRate: number) => {
    form.setValue("expectedReturn", returnRate);
  };

  function onSubmit(data: SwpFormValues) {
    const calculationResult = calculateSWP(
      data.initialAmount, 
      data.monthlyWithdrawal, 
      data.expectedReturn, 
      data.duration
    );
    
    // Generate yearly data for charts
    const yearlyData = [];
    let cumulativeWithdrawn = 0;
    
    for (let year = 1; year <= data.duration; year++) {
      const monthIndex = year * 12 - 1;
      if (monthIndex < calculationResult.monthlyData.length) {
        const monthData = calculationResult.monthlyData[monthIndex];
        cumulativeWithdrawn += data.monthlyWithdrawal * 12;
        
        yearlyData.push({
          year,
          balance: monthData.balance,
          totalWithdrawn: Math.min(cumulativeWithdrawn, calculationResult.totalWithdrawn)
        });
      }
    }

    setResult({
      ...calculationResult,
      yearlyData
    });
  }

  const durationOptions = Array.from({ length: 50 }, (_, i) => i + 1);

  return (
    <div className="space-y-8">
      {/* Mutual Fund Selector */}
      <MutualFundSelector
        selectedFund={selectedFund}
        onFundSelect={setSelectedFund}
        onExpectedReturnChange={handleExpectedReturnChange}
        expectedReturn={expectedReturn}
      />

      {/* SWP Calculator */}
      <Card className="wealth-card">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/10 to-emerald-500/20">
              <Wallet className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <CardTitle className="wealth-heading">{calculatorName}</CardTitle>
              <CardDescription>
                {selectedFund ? 
                  `Calculate SWP using ${selectedFund.schemeName.split(' - ')[0]} historical performance` :
                  "Plan your systematic withdrawal from investments"
                }
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <FormField
                  control={form.control}
                  name="initialAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 wealth-text" />
                        Initial Investment ({selectedCurrencySymbol})
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="e.g., 1000000" 
                          {...field} 
                          value={field.value ?? ""} 
                          className="focus-enhanced text-financial"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="monthlyWithdrawal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <TrendingDown className="h-4 w-4 text-blue-600" />
                        Monthly Withdrawal ({selectedCurrencySymbol})
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="e.g., 8000" 
                          {...field} 
                          value={field.value ?? ""} 
                          className="focus-enhanced text-financial"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="expectedReturn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <TrendingDown className="h-4 w-4 opportunity-text" />
                        Expected Return (%)
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="e.g., 8" 
                          {...field} 
                          value={field.value ?? ""} 
                          className="focus-enhanced text-financial"
                          step="0.1"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-primary" />
                        Duration (Years)
                      </FormLabel>
                      <Select onValueChange={(value) => field.onChange(Number(value))} defaultValue={String(field.value)}>
                        <FormControl>
                          <SelectTrigger className="focus-enhanced">
                            <SelectValue placeholder="Select duration" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {durationOptions.map(year => (
                            <SelectItem key={year} value={String(year)}>
                              {year} Year{year > 1 ? 's' : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* SWP Explanation */}
              <div className="wealth-tip">
                <div className="flex items-start gap-3">
                  <Wallet className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-blue-700 dark:text-blue-400">💡 SWP Strategy</p>
                    <p className="text-sm text-muted-foreground">
                      Systematic Withdrawal Plan (SWP) allows you to withdraw a fixed amount regularly from your mutual fund investments. 
                      It's ideal for retirees or those seeking regular income while keeping the remaining corpus invested for growth.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter>
              <Button type="submit" className="btn-wealth w-full sm:w-auto">
                <Calculator className="mr-2 h-4 w-4" />
                Calculate SWP Plan
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Summary Results */}
          <Card className="result-section">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-blue-600" />
                SWP Projection Summary
              </CardTitle>
              <CardDescription>
                {selectedFund ? `Based on ${selectedFund.schemeName.split(' - ')[0]} performance` : 'Estimated SWP results based on your inputs'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="metric-card">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Total Amount Withdrawn</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {selectedCurrencySymbol}{result.totalWithdrawn.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </p>
                  </div>
                </div>
                
                <div className="metric-card">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Remaining Balance</p>
                    <p className="text-2xl font-bold wealth-text">
                      {selectedCurrencySymbol}{result.remainingBalance.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </p>
                  </div>
                </div>
                
                <div className="metric-card">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Corpus Sustainability</p>
                    <p className="text-2xl font-bold opportunity-text">
                      {result.remainingBalance > 0 ? 'Sustained' : 'Depleted'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Detailed Table */}
              <div className="mt-6">
                <Table className="financial-table">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Metric</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Total Withdrawn</TableCell>
                      <TableCell className="text-right text-financial">
                        {selectedCurrencySymbol}{result.totalWithdrawn.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-right text-blue-600">
                        Completed
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Remaining Balance</TableCell>
                      <TableCell className="text-right text-financial wealth-text">
                        {selectedCurrencySymbol}{result.remainingBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-right">
                        {result.remainingBalance > 0 ? (
                          <span className="wealth-text">Available</span>
                        ) : (
                          <span className="text-red-600">Depleted</span>
                        )}
                      </TableCell>
                    </TableRow>
                    <TableRow className="border-t-2">
                      <TableCell className="font-bold">Withdrawal Rate</TableCell>
                      <TableCell className="text-right font-bold text-financial">
                        {((result.totalWithdrawn / (form.getValues("initialAmount") || 1)) * 100).toFixed(1)}%
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        of Initial Corpus
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Balance Depletion Chart */}
          <Card className="finance-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-blue-600" />
                Corpus Balance Over Time
              </CardTitle>
              <CardDescription>
                How your investment balance changes with regular withdrawals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={result.yearlyData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis 
                      dataKey="year" 
                      label={{ value: 'Years', position: 'insideBottom', offset: -5 }}
                    />
                    <YAxis 
                      label={{ value: `Balance (${selectedCurrencySymbol})`, angle: -90, position: 'insideLeft' }}
                      tickFormatter={(value) => `${selectedCurrencySymbol}${(value / 100000).toFixed(0)}L`}
                    />
                    <Tooltip 
                      formatter={(value: number, name: string) => [
                        `${selectedCurrencySymbol}${value.toLocaleString()}`,
                        name === 'balance' ? 'Remaining Balance' : 'Total Withdrawn'
                      ]}
                      labelFormatter={(year) => `Year ${year}`}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="balance" 
                      stroke="hsl(var(--wealth))" 
                      fill="hsl(var(--wealth))"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="totalWithdrawn" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Monthly Withdrawal Timeline */}
          <Card className="finance-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 opportunity-text" />
                Monthly Withdrawal Timeline
              </CardTitle>
              <CardDescription>
                First 24 months of withdrawal pattern
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {result.monthlyData.slice(0, 24).map((month, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                        {month.month}
                      </div>
                      <span className="text-sm font-medium">
                        Month {month.month}
                      </span>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-sm font-medium">
                        Withdrawn: {selectedCurrencySymbol}{month.withdrawn.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Balance: {selectedCurrencySymbol}{month.balance.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}