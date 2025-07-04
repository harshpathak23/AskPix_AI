'use server';

/**
 * @fileOverview An AI agent that identifies the subject of and solves a question from an image.
 *
 * - solveQuestion - The function to call to execute the question-solving flow.
 */

import { getGenkit } from '@/ai/genkit';
import {
  SolveQuestionInputSchema,
  type SolveQuestionInput,
  SolveQuestionOutputSchema,
  type SolveQuestionOutput,
} from '@/ai/schemas';

// Cached flow to avoid re-defining it on every call in the same server instance.
let solveQuestionFlow: any;

/**
 * Initializes the Genkit flow on demand.
 * This lazy initialization prevents the flow from being defined at module-load time,
 * which could crash the build process.
 * @returns The initialized Genkit flow function.
 */
function getSolveQuestionFlow() {
  if (solveQuestionFlow) {
    return solveQuestionFlow;
  }
  
  // First, get the lazily-initialized Genkit instance.
  const ai = getGenkit();

  // It specifies a stable vision model and requests a specific JSON output format.
  const solveQuestionPrompt = ai.definePrompt({
    name: 'solveQuestionPrompt',
    model: 'googleai/gemini-2.0-flash',
    input: {schema: SolveQuestionInputSchema},
    output: {
      format: 'json',
      schema: SolveQuestionOutputSchema
    },
    config: {
      temperature: 0.2,
    },
    prompt: `You are an expert tutor system. Your task is to analyze an image of an academic question and provide a comprehensive solution.
It is critical that your entire response is in the language with this code: {{{language}}}. For example, if the language code is 'hi', the entire response must be in Hindi.

Your task has multiple steps:
1.  **Analyze the Image**: Examine the image and understand the full question, including any text, diagrams, or formulas.
2.  **Identify the Subject**: First, you MUST determine the academic subject of the question. Choose from the following options: Mathematics, Physics, Chemistry, Biology, General. The user may have provided a hint, but you should make your own determination based on the image content. Put this in the 'identifiedSubject' field.
3.  **Provide a Solution**: Write a clear, comprehensive, and detailed step-by-step solution for the identified subject and topic. Explain each step thoroughly as if you were teaching the concept to a student for the first time. Break down complex concepts into simple, easy-to-understand parts. Your goal is to leave no room for confusion.
    - Use LaTeX for all mathematical formulas (e.g., $...$ for inline, $$...$$ for block).
    - Use double newlines to separate paragraphs for better readability and structure.
4.  **Provide relevant formulas**: In the 'formulas' field, provide a list of important formulas related to the question's topic.
    - Each formula must be formatted using LaTeX and be on a new line.
    - This section must also be in the requested language.

Image of the question is below:
{{media url=photoDataUri}}
{{#if subject}}
User's subject hint: {{{subject}}}
{{/if}}
`,
  });

  solveQuestionFlow = ai.defineFlow(
    {
      name: 'solveQuestionFlow',
      inputSchema: SolveQuestionInputSchema,
      outputSchema: SolveQuestionOutputSchema,
    },
    async (input) => {
      const {output} = await solveQuestionPrompt(input);
      if (!output) {
        throw new Error('Failed to process the image. The AI could not generate a response. Please try again.');
      }
      return output;
    },
  );

  return solveQuestionFlow;
}


/**
 * The main exported function to run the question solving flow.
 * It ensures the flow is initialized and then executes it.
 * @param input The question data.
 * @returns The solution output.
 */
export async function solveQuestion(input: SolveQuestionInput): Promise<SolveQuestionOutput> {
  const flow = getSolveQuestionFlow();
  return flow(input);
}
