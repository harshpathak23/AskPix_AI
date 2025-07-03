'use server';

import { solveQuestionFlow } from '@/ai/flows/solve-question';
import { type SolveQuestionInput, type SolveQuestionOutput } from '@/ai/schemas';

/**
 * Server action to process a question.
 * This acts as a safe boundary between client components and the server-only Genkit flows.
 * @param input The question data, including the image data URI.
 * @returns A promise that resolves to the solution output.
 */
export async function solveQuestion(input: SolveQuestionInput): Promise<SolveQuestionOutput> {
  // The Genkit flow handles input validation and will throw an error on failure.
  // We simply call it and return the result.
  return solveQuestionFlow(input);
}
