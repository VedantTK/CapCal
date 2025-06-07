"use client";

import { useState, useTransition } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Lightbulb } from 'lucide-react';
import { suggestChartType, type SuggestChartTypeInput, type SuggestChartTypeOutput } from '@/ai/flows/suggest-chart-type';

const formSchema = z.object({
  calculationType: z.string().min(3, { message: "Calculation type must be at least 3 characters." }),
  dataDescription: z.string().min(10, { message: "Data description must be at least 10 characters." }),
});

type FormData = z.infer<typeof formSchema>;

export default function AiChartSuggesterForm() {
  const [isPending, startTransition] = useTransition();
  const [suggestion, setSuggestion] = useState<SuggestChartTypeOutput | null>(null);
  const { toast } = useToast();

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    startTransition(async () => {
      try {
        const result = await suggestChartType(data);
        setSuggestion(result);
        toast({
          title: "Suggestion Ready!",
          description: `AI suggests a ${result.chartType}.`,
        });
      } catch (error) {
        console.error("Error getting chart suggestion:", error);
        toast({
          title: "Error",
          description: "Failed to get chart suggestion. Please try again.",
          variant: "destructive",
        });
        setSuggestion(null);
      }
    });
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="calculationType">Calculation Type</Label>
          <Input
            id="calculationType"
            placeholder="e.g., Stock Average, SIP Returns"
            {...register("calculationType")}
            className={errors.calculationType ? "border-destructive" : ""}
          />
          {errors.calculationType && <p className="text-sm text-destructive mt-1">{errors.calculationType.message}</p>}
        </div>

        <div>
          <Label htmlFor="dataDescription">Data Description</Label>
          <Textarea
            id="dataDescription"
            placeholder="Describe your data, e.g., 'Monthly SIP investment of $100 for 10 years, showing growth over time.' or 'Comparing sales figures for 5 different products.'"
            {...register("dataDescription")}
            className={errors.dataDescription ? "border-destructive" : ""}
            rows={5}
          />
          {errors.dataDescription && <p className="text-sm text-destructive mt-1">{errors.dataDescription.message}</p>}
        </div>

        <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lightbulb className="mr-2 h-4 w-4" />}
          Get Suggestion
        </Button>
      </form>

      {suggestion && (
        <Card className="mt-6 bg-accent/20 border-accent">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Lightbulb className="mr-2 h-5 w-5 text-accent-foreground" />
              AI Suggestion
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="font-semibold text-accent-foreground">Suggested Chart Type:</p>
              <p className="text-lg font-bold text-primary">{suggestion.chartType.toUpperCase()}</p>
            </div>
            <div>
              <p className="font-semibold text-accent-foreground">Reasoning:</p>
              <p className="text-sm text-muted-foreground">{suggestion.reasoning}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
