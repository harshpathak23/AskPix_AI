/**
 * @fileoverview Defines the server actions for the application.
 * Server actions are functions that run on the server and can be called directly
 * from client components, providing a seamless way to interact with the backend.
 */
'use server';

import { solveQuestionFlow } from '@/ai/flows/solve-question-flow';
import type { SolveQuestionInput, SolveQuestionOutput } from '@/ai/schemas';

/**
 * Solves a question based on the provided input.
 * This function acts as a wrapper around the Genkit AI flow, handling
 * input and returning either the solution or an error object.
 * @param input - The input data for solving the question.
 * @returns A promise that resolves to the solution or an error object.
 */
export async function solveQuestion(
  input: SolveQuestionInput
): Promise<SolveQuestionOutput & { error?: string }> {
  try {
    const result = await solveQuestionFlow(input);
    return result;
  } catch (e: any) {
    console.error('Error in solveQuestion action:', e);
    // Return a structured error to the client
    return {
      error: e.message || 'An unexpected error occurred.',
      // Provide default values for the output schema on error
      identifiedSubject: input.subject,
      topic: 'Error',
      solution: '',
      formulas: '',
    };
  }
}
