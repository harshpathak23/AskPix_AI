import { solveQuestion as solveQuestionFlow } from '@/ai/flows/solve-question';
import { type SolveQuestionInput, type SolveQuestionOutput } from '@/ai/schemas';

/**
 * This function calls the Genkit flow to solve the question.
 * By removing 'use server', we prevent build errors during static export for mobile.
 * The AI functionality is handled by webpack aliases in next.config.js for client-side builds.
 * @param input The question data including the image and other parameters.
 * @returns The solution from the AI.
 */
export async function solveQuestion(input: SolveQuestionInput): Promise<SolveQuestionOutput> {
  // The actual AI processing is in the imported flow.
  return solveQuestionFlow(input);
}
