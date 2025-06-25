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

const solveQuestionPrompt = `You are an expert tutor. A user has provided an image of a question for the subject: '${input.subject}'.

**TASK:**
1.  **Analyze the image** to understand the full question, including any text, diagrams, or formulas.
2.  **Provide a clear, detailed solution** to the question. Assume the user's chosen subject is correct and act as an expert tutor for that subject.

**IMPORTANT INSTRUCTIONS:**
1.  **Language:** You MUST provide the entire solution in the language specified by the 'language' code ('${input.language}').
2.  **Solution Format:** The solution must be a single, detailed string in the 'solution' field. Use newline characters (\\n) for paragraphs.
3.  **Math Notation:** Use LaTeX for all mathematical formulas. Inline math: $...$. Block math: $$...$$. Math symbols should not be translated.
4.  **JSON Output:** Your entire response MUST be a single, valid JSON object that adheres to the output schema.
    *   **For Math/Biology questions (or any question not needing a graph):** The JSON should ONLY contain the 'solution' field.
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

**SUBJECT: ${input.subject}**
**TARGET LANGUAGE: ${input.language}**

Provide the solution now based on the content of the image.`;


const solveQuestionFlow = ai.defineFlow(
  {
    name: 'solveQuestionFlow',
    inputSchema: SolveQuestionInputSchema,
    outputSchema: SolveQuestionOutputSchema,
  },
  async (input) => {
    
    const {output} = await ai.generate({
      model: 'googleai/gemini-1.5-pro-latest',
      prompt: [
        {text: solveQuestionPrompt},
        {media: {url: input.photoDataUri}},
      ],
      output: {
        schema: SolveQuestionOutputSchema,
      }
    });

    if (!output) {
      throw new Error("The AI failed to generate a valid solution. The image may be unclear or the question may be outside the supported subjects.");
    }
    
    return output;
  }
);
