'use server';

import { type SolveQuestionInput, type SolveQuestionOutput } from '@/ai/schemas';

/**
 * Server action to process a question.
 * This function now dynamically imports the AI flow to prevent server-only code
 * from being bundled into the client-side build, which is essential for static exports.
 *
 * @param input The question data, including the image data URI.
 * @returns a promise that resolves to the solution output.
 */
export async function solveQuestion(input: SolveQuestionInput): Promise<SolveQuestionOutput> {
  // Dynamically import the flow only when the action is called on the server.
  const { solveQuestion: runFlow } = await import('@/ai/flows/solve-question');
  return runFlow(input);
}
