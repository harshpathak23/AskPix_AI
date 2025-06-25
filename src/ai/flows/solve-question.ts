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

// This prompt is now simplified. It does NOT specify an output schema,
// so it will return raw text, which is a more robust approach.
const solveQuestionPrompt = ai.definePrompt({
  name: 'solveQuestionPrompt',
  input: {schema: SolveQuestionInputSchema},
  config: {
    temperature: 0.2,
  },
  prompt: `You are an expert tutor for the subject: {{{subject}}}.
A user has provided an image of a question.
Your entire response MUST be in the language with this code: {{{language}}}.

Analyze the image to understand the full question, including any text, diagrams, or formulas.
Provide a clear, detailed, step-by-step solution to the question.
Use LaTeX for all mathematical formulas (e.g., $...$ for inline, $$...$$ for block).

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
    // Generate raw text from the model using the simplified prompt
    const response = await solveQuestionPrompt(input);
    const solutionText = response.text;

    if (!solutionText) {
      throw new Error('Failed to process the image. The AI could not generate a response. Please try again.');
    }

    // Manually construct the object to match the flow's required output schema
    return {
      solution: solutionText,
    };
  },
);
