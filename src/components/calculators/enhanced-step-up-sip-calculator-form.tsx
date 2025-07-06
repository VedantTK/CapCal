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
import { TrendingUp, Calculator, Target, DollarSign, ArrowUp } from "lucide-react";
import { useCurrency } from "@/contexts/currency-context";
import { calculateStepUpSIP, type MutualFund } from "@/lib/mutual-funds";
import MutualFundSelector from "@/components/mutual-fund-selector";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const stepUpSipSchema = z.object({
  initialAmount: z.coerce.number().positive("Initial amount must be positive"),
  stepUpPercentage: z.coerce.number().min(0, "Step-up cannot be negative").max(50, "Step-up seems too high"),
  duration: z.coerce.number().int().min(1, "Duration must be at least 1 year").max(50, "Duration max 50 years"),
  expectedReturn: z.coerce.number().min(0, "Return rate cannot be negative").max(50, "Return rate seems too high"),
});

type StepUpSipFormValues = z.infer<typeof stepUpSipSchema>;

interface StepUpSipResult {
  totalInvested: number;
  finalCorpus: number;
  gain: number;
  chartData: Array<{ year: number; invested: number; value: number; sipAmount: number }>;
}

interface EnhancedStepUpSipCalculatorFormProps {
  calculatorName: string;
}

export default function EnhancedStepUpSipCalculatorForm({ calculatorName }: EnhancedStepUpSipCalculatorFormProps) {
  const { selectedCurrencySymbol } = useCurrency();
  const [result, setResult] = useState<StepUpSipResult | null>(null);
  const [selectedFund, setSelectedFund] = useState<MutualFund | null>(null);

  const form = useForm<StepUpSipFormValues>({
    resolver: zodResolver(stepUpSipSchema),
    defaultValues: {
      initialAmount: undefined,
      stepUpPercentage: 10,
      duration: 10,
      expectedReturn: 12,
    },
  });

  const expectedReturn = form.watch("expectedReturn");

  const handleExpectedReturnChange = (returnRate: number) => {
    form.setValue("expectedReturn", returnRate);
  };

  function onSubmit(data: StepUpSipFormValues) {
    const calculationResult = calculateStepUpSIP(
      data.initialAmount, 
      data.stepUpPercentage, 
      data.expectedReturn, 
      data.duration
    );
    
    // Generate chart data
    const chartData = [];
    let currentSIP = data.initialAmount;
    
    for (let year = 1; year <= data.duration; year++) {
      const yearResult = calculateStepUpSIP(
        data.initialAmount, 
        data.stepUpPercentage, 
        data.expectedReturn, 
        year
      );
      
      chartData.push({
        year,
        invested: yearResult.totalInvested,
        value: yearResult.finalCorpus,
        sipAmount: currentSIP
      });
      
      currentSIP *= (1 + data.stepUpPercentage / 100);
    }

    setResult({
      ...calculationResult,
      chartData
    });
  }

  const durationOptions = Array.from({ length: 50 }, (_, i) => i + 1);
  const stepUpOptions = Array.from({ length: 21 }, (_, i) => i * 2.5);

  return (
    <div className="space-y-8">
      {/* Mutual Fund Selector */}
      <MutualFundSelector
        selectedFund={selectedFund}
        onFundSelect={setSelectedFund}
        onExpectedReturnChange={handleExpectedReturnChange}
        expectedReturn={expectedReturn}
      />

      {/* Step-up SIP Calculator */}
      <Card className="wealth-card">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500/10 to-amber-500/20">
              <ArrowUp className="h-6 w-6 wealth-text" />
            </div>
            <div>
              <CardTitle className="wealth-heading">{calculatorName}</CardTitle>
              <CardDescription>
                {selectedFund ? 
                  `Calculate step-up SIP returns using ${selectedFund.schemeName.split(' - ')[0]} historical performance` :
                  "Estimate returns with annual SIP amount increases"
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
                        Initial Monthly SIP ({selectedCurrencySymbol})
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="e.g., 5000" 
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
                  name="stepUpPercentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <ArrowUp className="h-4 w-4 opportunity-text" />
                        Annual Step-up (%)
                      </FormLabel>
                      <Select onValueChange={(value) => field.onChange(Number(value))} defaultValue={String(field.value)}>
                        <FormControl>
                          <SelectTrigger className="focus-enhanced">
                            <SelectValue placeholder="Select step-up %" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {stepUpOptions.map(rate => (
                            <SelectItem key={rate} value={String(rate)}>{rate}%</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                        <TrendingUp className="h-4 w-4 opportunity-text" />
                        Expected Return (%)
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="e.g., 12" 
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

              {/* Step-up Explanation */}
              <div className="wealth-tip">
                <div className="flex items-start gap-3">
                  <ArrowUp className="h-5 w-5 wealth-text flex-shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <p className="text-sm font-medium wealth-text">💡 Step-up SIP Advantage</p>
                    <p className="text-sm text-muted-foreground">
                      Step-up SIP allows you to increase your investment amount annually, typically matching your salary increments. 
                      This strategy helps you invest more as your income grows, significantly boosting your wealth accumulation over time.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter>
              <Button type="submit" className="btn-wealth w-full sm:w-auto">
                <Calculator className="mr-2 h-4 w-4" />
                Calculate Step-up SIP Returns
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
                <ArrowUp className="h-5 w-5 wealth-text" />
                Step-up SIP Projection
              </CardTitle>
              <CardDescription>
                {selectedFund ? `Based on ${selectedFund.schemeName.split(' - ')[0]} performance` : 'Estimated returns with annual step-up'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="metric-card">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Total Amount Invested</p>
                    <p className="text-2xl font-bold text-foreground">
                      {selectedCurrencySymbol}{result.totalInvested.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </p>
                  </div>
                </div>
                
                <div className="metric-card">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Estimated Returns</p>
                    <p className="text-2xl font-bold wealth-text">
                      {selectedCurrencySymbol}{result.gain.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </p>
                  </div>
                </div>
                
                <div className="metric-card">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Final Corpus</p>
                    <p className="text-2xl font-bold opportunity-text">
                      {selectedCurrencySymbol}{result.finalCorpus.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
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
                      <TableHead className="text-right">Percentage</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Total Investment</TableCell>
                      <TableCell className="text-right text-financial">
                        {selectedCurrencySymbol}{result.totalInvested.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-right">
                        {((result.totalInvested / result.finalCorpus) * 100).toFixed(1)}%
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Capital Gains</TableCell>
                      <TableCell className="text-right text-financial wealth-text">
                        {selectedCurrencySymbol}{result.gain.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-right wealth-text">
                        {((result.gain / result.finalCorpus) * 100).toFixed(1)}%
                      </TableCell>
                    </TableRow>
                    <TableRow className="border-t-2">
                      <TableCell className="font-bold">Final Corpus</TableCell>
                      <TableCell className="text-right font-bold text-financial opportunity-text">
                        {selectedCurrencySymbol}{result.finalCorpus.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-right font-bold">100%</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Growth Chart */}
          <Card className="finance-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 wealth-text" />
                Step-up SIP Growth Projection
              </CardTitle>
              <CardDescription>
                Visual representation of your step-up SIP investment growth over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={result.chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis 
                      dataKey="year" 
                      label={{ value: 'Years', position: 'insideBottom', offset: -5 }}
                    />
                    <YAxis 
                      label={{ value: `Amount (${selectedCurrencySymbol})`, angle: -90, position: 'insideLeft' }}
                      tickFormatter={(value) => `${selectedCurrencySymbol}${(value / 100000).toFixed(0)}L`}
                    />
                    <Tooltip 
                      formatter={(value: number, name: string) => [
                        `${selectedCurrencySymbol}${value.toLocaleString()}`,
                        name === 'invested' ? 'Total Invested' : 'Final Corpus'
                      ]}
                      labelFormatter={(year) => `Year ${year}`}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="invested" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="hsl(var(--wealth))" 
                      strokeWidth={3}
                      dot={{ fill: 'hsl(var(--wealth))', strokeWidth: 2, r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* SIP Amount Progression */}
          <Card className="finance-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowUp className="h-5 w-5 opportunity-text" />
                Annual SIP Amount Progression
              </CardTitle>
              <CardDescription>
                How your monthly SIP amount increases each year
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={result.chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis 
                      dataKey="year" 
                      label={{ value: 'Years', position: 'insideBottom', offset: -5 }}
                    />
                    <YAxis 
                      label={{ value: `Monthly SIP (${selectedCurrencySymbol})`, angle: -90, position: 'insideLeft' }}
                      tickFormatter={(value) => `${selectedCurrencySymbol}${(value / 1000).toFixed(0)}K`}
                    />
                    <Tooltip 
                      formatter={(value: number) => [
                        `${selectedCurrencySymbol}${value.toLocaleString()}`,
                        'Monthly SIP Amount'
                      ]}
                      labelFormatter={(year) => `Year ${year}`}
                    />
                    <Bar 
                      dataKey="sipAmount" 
                      fill="hsl(var(--opportunity))" 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}