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
1.  **Language:** You MUST provide the entire solution in the language specified by the 'language' code ('en' for English, 'hi' for Hindi).
2.  **Solution Format:** The solution must be a single, detailed string in the 'solution' field. Use newline characters (\\n) for paragraphs.
3.  **Math Notation:** Use LaTeX for all mathematical formulas. Inline math: $...$. Block math: $$...$$. Math symbols should not be translated.
4.  **JSON Output:** Your entire response MUST be a single, valid JSON object that adheres to the output schema.
    *   **For Math/Biology questions (or any question not needing a graph):** The JSON should ONLY contain the 'solution' field. OMIT the 'graphData' field.
        Example:
        {
          "solution": "The step-by-step solution goes here..."
        }
    *   **For Physics/Chemistry questions (where a graph is helpful):** The JSON should contain both 'solution' and 'graphData' fields.
        Example:
        {
          "solution": "The detailed step-by-step solution goes here...",
          "graphData": {
            "title": "Velocity vs. Time",
            "data": [
              { "name": "0s", "value": 0 },
              { "name": "1s", "value": 9.8 }
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
