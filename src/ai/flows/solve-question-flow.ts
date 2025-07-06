/**
 * @fileoverview Defines the AI flow for solving an academic question from an image.
 * This flow takes an image and user-provided context, analyzes it, and returns
 * a detailed, step-by-step solution.
 */
'use server';

import { ai } from '@/ai/genkit';
import { SolveQuestionInputSchema, SolveQuestionOutputSchema } from '@/ai/schemas';

const solveQuestionPrompt = ai.definePrompt({
  name: 'solveQuestionPrompt',
  model: 'googleai/gemini-2.0-flash',
  input: { schema: SolveQuestionInputSchema },
  output: { schema: SolveQuestionOutputSchema },
  prompt: `You are an expert AI tutor specializing in a variety of academic subjects.
Your task is to analyze the provided image of a question and generate a comprehensive, step-by-step solution.

**Analysis Steps:**
1.  **Identify the Subject:** Examine the image and determine the correct academic subject. This might be different from the user's selection of '{{{subject}}}'. The identified subject should be one of: Mathematics, Physics, Chemistry, Biology, or General.
2.  **Identify the Topic:** Determine the specific topic within that subject.
3.  **Solve the Problem:** Provide a clear, detailed, step-by-step solution.
4.  **Language:** The entire response must be in the target language: '{{{language}}}'.
5.  **Formatting:**
    *   Use Markdown for clear formatting (headings, lists, bold text).
    *   Use KaTeX for all mathematical notation. Use $$...$$ for block equations and $...$ for inline equations.

**User Provided Information:**
- Subject Hint: {{{subject}}}
- Question Image: {{media url=photoDataUri}}

Generate the response according to the output schema.
`,
});

export const solveQuestionFlow = ai.defineFlow(
  {
    name: 'solveQuestionFlow',
    inputSchema: SolveQuestionInputSchema,
    outputSchema: SolveQuestionOutputSchema,
  },
  async (input) => {
    const { output } = await solveQuestionPrompt(input);

    if (!output) {
      throw new Error('The AI failed to generate a valid solution.');
    }

    return output;
  }
);
