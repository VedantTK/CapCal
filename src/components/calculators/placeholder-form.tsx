
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useCurrency } from "@/contexts/currency-context";
import { Info } from "lucide-react";

interface PlaceholderFormProps {
  calculatorName: string;
}

export default function PlaceholderForm({ calculatorName }: PlaceholderFormProps) {
  const { selectedCurrencySymbol } = useCurrency();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // Toast can be re-added if needed, but inline message is clearer for now
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{calculatorName}</CardTitle>
        <CardDescription>Enter parameters to calculate.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="field1">Sample Field 1 ({selectedCurrencySymbol})</Label>
            <Input id="field1" type="number" placeholder="Enter value" disabled />
          </div>
          <div>
            <Label htmlFor="field2">Sample Field 2</Label>
            <Input id="field2" type="text" placeholder="Enter text" disabled />
          </div>
           <div className="mt-4 flex items-center gap-2 rounded-md border border-blue-500/50 bg-blue-50 p-3 text-sm text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
            <Info className="h-5 w-5 shrink-0" />
            <span>The full calculation logic for the {calculatorName} is coming soon!</span>
          </div>
        </CardContent>
        <CardFooter className="flex-col items-stretch gap-4">
          <Button type="submit" disabled className="w-full sm:w-auto">
            Calculate (Coming Soon)
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
