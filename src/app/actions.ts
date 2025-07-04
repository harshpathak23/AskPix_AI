
import { solveQuestion as solveQuestionFlow } from '@/ai/flows/solve-question';
import { type SolveQuestionInput, type SolveQuestionOutput } from '@/ai/schemas';

/**
 * This function calls the Genkit flow to solve the question.
 * Note: This is not a Server Action and is included in the client bundle.
 * The underlying Genkit calls are mocked out for static builds.
 * @param input The question data including the image and other parameters.
 * @returns The solution from the AI.
 */
export async function solveQuestion(input: SolveQuestionInput): Promise<SolveQuestionOutput> {
  // The actual AI processing is in the imported flow.
  return solveQuestionFlow(input);
}
