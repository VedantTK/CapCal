"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useCurrency } from "@/contexts/currency-context";

interface PlaceholderFormProps {
  calculatorName: string;
}

export default function PlaceholderForm({ calculatorName }: PlaceholderFormProps) {
  const { toast } = useToast();
  const { currency } = useCurrency();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    toast({
      title: "Calculation Submitted (Placeholder)",
      description: `${calculatorName} form submitted with currency ${currency}. Actual calculation logic coming soon.`,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="field1">Sample Field 1 ({currency})</Label>
        <Input id="field1" type="number" placeholder="Enter value" />
      </div>
      <div>
        <Label htmlFor="field2">Sample Field 2</Label>
        <Input id="field2" type="text" placeholder="Enter text" />
      </div>
      <Button type="submit">Calculate (Coming Soon)</Button>
    </form>
  );
}
