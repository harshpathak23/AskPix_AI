'use server';

import { type SolveQuestionInput, type SolveQuestionOutput } from '@/ai/schemas';
import { solveQuestion as runFlow } from '@/ai/flows/solve-question';

/**
 * Server action to process a question.
 *
 * @param input The question data, including the image data URI.
 * @returns a promise that resolves to the solution output.
 */
export async function solveQuestion(input: SolveQuestionInput): Promise<SolveQuestionOutput> {
  return runFlow(input);
}
