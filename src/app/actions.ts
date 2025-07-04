
import { solveQuestion as solveQuestionFlow } from '@/ai/flows/solve-question';
import { type SolveQuestionInput, type SolveQuestionOutput } from '@/ai/schemas';

/**
 * This is a Next.js Server Action that calls the Genkit flow to solve the question.
 * This function is executed on the server.
 * @param input The question data including the image and other parameters.
 * @returns The solution from the AI.
 */
export async function solveQuestion(input: SolveQuestionInput): Promise<SolveQuestionOutput> {
  // The actual AI processing is in the imported flow.
  return solveQuestionFlow(input);
}
