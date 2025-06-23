'use server';

/**
 * @fileOverview An AI agent that solves math, physics, and chemistry questions from an image.
 *
 * - solveQuestion - A function that handles the question-solving process.
 * - SolveQuestionInput - The input type for the solveQuestion function.
 * - SolveQuestionOutput - The return type for the solveQuestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SolveQuestionInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a question, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  subject: z
    .string()
    .describe('The subject of the question (e.g., Mathematics, Physics, Chemistry).'),
  language: z
    .string()
    .describe('The language in which the solution should be provided. Options: en (English), hi (Hindi).')
    .default('en'),
});
export type SolveQuestionInput = z.infer<typeof SolveQuestionInputSchema>;

const SolveQuestionOutputSchema = z.object({
  solutionSteps: z.array(z.string()).describe('An array of strings, where each string is a step in the solution.'),
});
export type SolveQuestionOutput = z.infer<typeof SolveQuestionOutputSchema>;

export async function solveQuestion(input: SolveQuestionInput): Promise<SolveQuestionOutput> {
  const result = await solveQuestionFlow(input);
  return { solutionSteps: result.solutionSteps || [] };
}

const prompt = ai.definePrompt({
  name: 'solveQuestionPrompt',
  input: {schema: SolveQuestionInputSchema},
  output: {schema: SolveQuestionOutputSchema},
  prompt: `You are an expert {{subject}} tutor. Your task is to solve the question in the provided image.
Provide a clear, step-by-step solution. Each step in the solution should be a separate string in the solutionSteps array.
Use LaTeX for all mathematical formulas, enclosing inline math in $...$ and display math in $$...$$.
The language for the solution should be: {{language}}. Use 'en' for English and 'hi' for Hindi.

Image: {{media url=photoDataUri}}

Please format your response clearly. Your entire response should be the array of solution steps.`,
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
