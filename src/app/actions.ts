'use server';

import { type SolveQuestionInput, type SolveQuestionOutput } from '@/ai/schemas';

/**
 * Server action to process a question.
 * This acts as a safe boundary between client components and the server-only Genkit flows.
 * It uses a dynamic import to ensure the AI flow and its dependencies are not part
 * of the initial server bundle during the static build (`output: 'export'`),
 * which has been the cause of the persistent build failures.
 *
 * @param input The question data, including the image data URI.
 * @returns a promise that resolves to the solution output.
 */
export async function solveQuestion(input: SolveQuestionInput): Promise<SolveQuestionOutput> {
  // Dynamically import the flow only when the action is executed.
  // This prevents the build system from analyzing the AI code during static export.
  const { solveQuestion: runFlow } = await import('@/ai/flows/solve-question');

  return runFlow(input);
}
