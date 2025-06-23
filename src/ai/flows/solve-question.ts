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
  const result = await solveQuestionFlow(input);
  return { solutionSteps: result.solutionSteps || [] };
}

const prompt = ai.definePrompt({
  name: 'solveQuestionPrompt',
  input: {schema: SolveQuestionInputSchema},
  output: {schema: SolveQuestionOutputSchema},
  prompt: `You are an expert {{subject}} tutor. The user has provided a cropped image focusing on a specific question.
Your task is to analyze this image and provide a clear, step-by-step solution to the question shown.

**IMPORTANT INSTRUCTIONS:**
1. You MUST provide the entire solution in the language specified by the 'language' code.
   - 'en' means English.
   - 'hi' means Hindi.
2. The solution must be broken down into logical steps. Each step must be a separate string in the 'solutionSteps' array.
3. Use LaTeX for all mathematical formulas. Enclose inline math in $...$ and display math (for block equations) in $$...$$. Mathematical formulas and symbols should NOT be translated and should remain in standard mathematical notation.
4. The output must be in JSON format.

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
