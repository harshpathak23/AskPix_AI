'use server';

/**
 * @fileOverview An AI agent that solves math, physics, and chemistry questions from an image.
 *
 * - solveQuestion - A function that handles the question-solving process.
 */

import {ai} from '@/ai/genkit';
import {
  SolveQuestionInputSchema,
  type SolveQuestionInput,
  SolveQuestionOutputSchema,
  type SolveQuestionOutput,
} from '@/ai/schemas';

export async function solveQuestion(input: SolveQuestionInput): Promise<SolveQuestionOutput> {
  return solveQuestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'solveQuestionPrompt',
  input: {schema: SolveQuestionInputSchema},
  output: {schema: SolveQuestionOutputSchema},
  prompt: `You are an expert {{subject}} tutor. The user has provided a cropped image focusing on a specific question.
Your task is to analyze this image and provide a clear, detailed solution.

**IMPORTANT INSTRUCTIONS:**
1. You MUST provide the entire solution in the language specified by the 'language' code.
   - 'en' means English.
   - 'hi' means Hindi.
2. The solution must be a single, detailed string in the 'solution' field. Break down the explanation into logical steps within this single string, using newline characters (\\n) to separate paragraphs.
3. Use LaTeX for all mathematical formulas. Enclose inline math in $...$ and display math (for block equations) in $$...$$. Mathematical formulas and symbols should NOT be translated and should remain in standard mathematical notation.
4. **Graph Generation (for Physics & Chemistry):** If the subject is Physics or Chemistry and a visual graph would significantly aid in explaining the answer (e.g., plotting velocity vs. time, reaction rate vs. concentration), you MUST generate the data for a bar chart and populate the 'graphData' field. If a graph is not relevant, leave 'graphData' empty.
5. The output must be in JSON format. For example, if a graph is needed, your output must look like this:
   {
     "solution": "The detailed step-by-step solution goes here...",
     "graphData": {
       "title": "Velocity vs. Time",
       "data": [
         { "name": "0s", "value": 0 },
         { "name": "1s", "value": 9.8 },
         { "name": "2s", "value": 19.6 },
         { "name": "3s", "value": 29.4 }
       ],
       "xAxisLabel": "Time (s)",
       "yAxisLabel": "Velocity (m/s)"
     }
   }

**TARGET LANGUAGE: {{language}}**

Image: {{media url=photoDataUri}}

Provide the solution now.`,
});

const solveQuestionFlow = ai.defineFlow(
  {
    name: 'solveQuestionFlow',
    inputSchema: SolveQuestionInputSchema,
    outputSchema: SolveQuestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
