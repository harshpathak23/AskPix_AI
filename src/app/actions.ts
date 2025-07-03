'use server';

import { type SolveQuestionInput, type SolveQuestionOutput } from '@/ai/schemas';

/**
 * Server action to process a question.
 * This acts as a safe boundary between client components and the server-only Genkit flows.
 * It lazily imports the flow to prevent build-time errors when environment variables are not present.
 * @param input The question data, including the image data URI.
 * @returns A promise that resolves to the solution output.
 */
export async function solveQuestion(input: SolveQuestionInput): Promise<SolveQuestionOutput> {
  // Lazily import the flow to prevent it from running at build time.
  const { solveQuestionFlow } = await import('@/ai/flows/solve-question');
  
  // The Genkit flow handles input validation and will throw an error on failure.
  // We simply call it and return the result.
  return solveQuestionFlow(input);
}
