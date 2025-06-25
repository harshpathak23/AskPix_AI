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

const solveQuestionPrompt = ai.definePrompt({
  name: 'solveQuestionPrompt',
  input: {schema: SolveQuestionInputSchema},
  output: {schema: SolveQuestionOutputSchema},
  prompt: `You are an expert tutor. A user has provided an image of a question.

**TASK:**
1.  Analyze the image to understand the full question, including any text, diagrams, or formulas.
2.  Provide a clear, detailed, step-by-step solution to the question.

**IMPORTANT INSTRUCTIONS:**
*   **Subject:** You must act as an expert for the given subject: {{{subject}}}.
*   **Language:** You MUST provide the entire solution in the language specified: {{{language}}}.
*   **Math Notation:** Use LaTeX for all mathematical formulas (e.g., $...$ for inline, $$...$$ for block).

Image of the question is below:
{{media url=photoDataUri}}
`,
});

const solveQuestionFlow = ai.defineFlow(
  {
    name: 'solveQuestionFlow',
    inputSchema: SolveQuestionInputSchema,
    outputSchema: SolveQuestionOutputSchema,
  },
  async (input) => {
    const {output} = await ai.generate({
      model: 'gemini-pro-vision',
      prompt: await solveQuestionPrompt.render(input),
      output: {
        schema: SolveQuestionOutputSchema,
      },
      config: {
        temperature: 0.2,
      },
    });

    if (!output) {
      throw new Error('Failed to process the image. Please try again.');
    }

    return output;
  },
);
