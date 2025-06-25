'use server';

/**
 * @fileOverview An AI agent that solves math, physics, and chemistry questions from an image.
 *
 * - solveQuestion - A function that handles the question-solving process.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/googleai';
import {
  SolveQuestionInputSchema,
  type SolveQuestionInput,
  SolveQuestionOutputSchema,
  type SolveQuestionOutput,
} from '@/ai/schemas';

export async function solveQuestion(input: SolveQuestionInput): Promise<SolveQuestionOutput> {
  return solveQuestionOrchestratorFlow(input);
}

const solveQuestionOrchestratorFlow = ai.defineFlow(
  {
    name: 'solveQuestionOrchestratorFlow',
    inputSchema: SolveQuestionInputSchema,
    outputSchema: SolveQuestionOutputSchema,
  },
  async (input) => {
    // Step 1: Use a vision model to extract the text from the image. This is a more reliable approach.
    const extractionPrompt = `Analyze the provided image and extract any and all text related to the academic question shown. Output only the raw text content of the question. Do not attempt to solve it.`;

    const visionResult = await ai.generate({
      model: googleAI.model('gemini-1.5-pro-latest'),
      prompt: [
        {text: extractionPrompt},
        {media: {url: input.photoDataUri}},
      ],
    });
    
    const extractedQuestionText = visionResult.text;

    if (!extractedQuestionText) {
      throw new Error("The AI could not read any text from the image. Please try taking a clearer picture.");
    }

    // Step 2: Use a powerful language model to solve the extracted text and generate structured JSON.
    const solvingPrompt = `You are an expert tutor. The user has provided a question for the subject: '${input.subject}'. The question is: "${extractedQuestionText}".

**TASK:**
1.  **Assume the user's subject is correct.** Act as an expert tutor for '${input.subject}'.
2.  **Provide a clear, detailed solution** to the question.

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
**QUESTION TEXT: ${extractedQuestionText}**
**TARGET LANGUAGE: ${input.language}**

Provide the solution now.`;

    const {output} = await ai.generate({
      model: googleAI.model('gemini-1.5-pro-latest'),
      prompt: solvingPrompt,
      output: {
        schema: SolveQuestionOutputSchema,
      }
    });

    if (!output) {
      throw new Error("The AI failed to generate a valid solution from the extracted text.");
    }
    
    return output;
  }
);
