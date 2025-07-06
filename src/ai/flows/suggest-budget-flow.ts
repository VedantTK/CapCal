'use server';
/**
 * @fileOverview An AI flow to suggest a monthly budget breakdown.
 *
 * - suggestBudget - A function that handles the budget suggestion process.
 * - SuggestBudgetInput - The input type for the suggestBudget function.
 * - SuggestBudgetOutput - The return type for the suggestBudget function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestBudgetInputSchema = z.object({
  monthlySalary: z.number().positive('Monthly salary must be a positive number.'),
  currencySymbol: z.string().describe('The currency symbol for the salary (e.g., $, €, ₹).'),
  dependents: z.number().int().min(0).describe('Number of dependents.'),
});
export type SuggestBudgetInput = z.infer<typeof SuggestBudgetInputSchema>;

const BudgetItemSchema = z.object({
    category: z.string().describe("The budget category (e.g., Rent, Groceries, Investing)."),
    amount: z.number().describe("The suggested amount for this category."),
    icon: z.string().optional().describe("An appropriate Lucide icon name for the category (e.g., 'Home', 'UtensilsCrossed', 'Car')."),
});

const SuggestBudgetOutputSchema = z.object({
  budgetItems: z.array(BudgetItemSchema).describe("An array of budget items."),
  summary: z.string().describe("A brief, encouraging summary of the suggested budget (1-2 sentences).")
});
export type SuggestBudgetOutput = z.infer<typeof SuggestBudgetOutputSchema>;

export async function suggestBudget(input: SuggestBudgetInput): Promise<SuggestBudgetOutput> {
  return suggestBudgetFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestBudgetPrompt',
  input: {schema: SuggestBudgetInputSchema},
  output: {schema: SuggestBudgetOutputSchema},
  prompt: `You are a friendly and practical financial planner AI. Your goal is to help a middle-class user create a sensible monthly budget.

Given the user's monthly salary, currency, and number of dependents, provide a detailed budget breakdown.

**Instructions:**
1.  The sum of all budget item amounts MUST exactly equal the provided monthly salary. Do not go over or under.
2.  Create a realistic budget. Prioritize needs like housing, food, and transport.
3.  Allocate a significant portion to 'Savings & Investing' (at least 20-30% if possible).
4.  Include categories like 'Rent/Mortgage', 'Utilities', 'Transport', 'Food & Groceries', 'Insurance', 'Savings & Investing', 'Entertainment', 'Personal Care', and 'Miscellaneous'. You can adjust categories based on what's logical.
5.  For each category, provide a suggested amount and a relevant icon name from the 'lucide-react' library. Choose simple, recognizable icons. Examples: Home for Rent, UtensilsCrossed for Food, PiggyBank for Savings.
6.  Provide a short, encouraging summary of the budget plan.

**User Details:**
- Monthly Salary: {{{currencySymbol}}}{{{monthlySalary}}}
- Dependents: {{{dependents}}}

Generate the budget breakdown now.
`,
});

const suggestBudgetFlow = ai.defineFlow(
  {
    name: 'suggestBudgetFlow',
    inputSchema: SuggestBudgetInputSchema,
    outputSchema: SuggestBudgetOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
