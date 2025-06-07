'use server';

/**
 * @fileOverview AI agent that suggests the most appropriate chart type for visualizing financial data.
 *
 * - suggestChartType - A function that suggests a chart type based on input data and calculation type.
 * - SuggestChartTypeInput - The input type for the suggestChartType function.
 * - SuggestChartTypeOutput - The return type for the suggestChartType function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestChartTypeInputSchema = z.object({
  calculationType: z
    .string()
    .describe('The type of financial calculation performed (e.g., Stock Average, SIP, EMI).'),
  dataDescription: z
    .string()
    .describe('A description of the data to be visualized, including data ranges and important data points.'),
});
export type SuggestChartTypeInput = z.infer<typeof SuggestChartTypeInputSchema>;

const SuggestChartTypeOutputSchema = z.object({
  chartType: z
    .string()
    .describe(
      'The suggested chart type for visualizing the data (e.g., line chart, bar chart, pie chart).' + 
      'Must be one of the following: line chart, bar chart, pie chart, scatter plot'
    ),
  reasoning: z
    .string()
    .describe('The reasoning behind the suggested chart type, explaining why it is appropriate.'),
});
export type SuggestChartTypeOutput = z.infer<typeof SuggestChartTypeOutputSchema>;

export async function suggestChartType(input: SuggestChartTypeInput): Promise<SuggestChartTypeOutput> {
  return suggestChartTypeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestChartTypePrompt',
  input: {schema: SuggestChartTypeInputSchema},
  output: {schema: SuggestChartTypeOutputSchema},
  prompt: `You are an expert data visualization specialist. Based on the type of financial calculation and the data provided, you will suggest the most appropriate chart type to visualize the data.

Calculation Type: {{{calculationType}}}
Data Description: {{{dataDescription}}}

You must respond with a chartType of either 'line chart', 'bar chart', 'pie chart', or 'scatter plot'.

Consider these options:

- Line chart: Useful for showing trends over time.
- Bar chart: Useful for comparing different categories or values.
- Pie chart: Useful for showing proportions of a whole.
- Scatter plot: Useful for showing the relationship between two variables.

Explain your reasoning for selecting the chart type.
`,
});

const suggestChartTypeFlow = ai.defineFlow(
  {
    name: 'suggestChartTypeFlow',
    inputSchema: SuggestChartTypeInputSchema,
    outputSchema: SuggestChartTypeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
