'use server';

import { type SolveQuestionInput, type SolveQuestionOutput } from '@/ai/schemas';
import { solveQuestion as runFlow } from '@/ai/flows/solve-question';

/**
 * Server action to process a question.
 * This acts as a safe boundary between client components and the server-only Genkit flows.
 * It now uses a direct import, relying on the 'use server' directive in the imported
 * file and webpack aliasing to handle build-time server/client separation.
 * @param input The question data, including the image data URI.
 * @returns a promise that resolves to the solution output.
 */
export async function solveQuestion(input: SolveQuestionInput): Promise<SolveQuestionOutput> {
  // The Genkit flow handles input validation and will throw an error on failure.
  // We simply call it and return the result.
  return runFlow(input);
}
