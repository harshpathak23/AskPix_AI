/**
 * @fileoverview This file contains server-side logic (Server Actions)
 * used by the web application. The statically-built mobile app does not use
 * these directly; instead, it calls the corresponding API routes.
 */
'use server';

import { solveQuestionFlow } from '@/ai/flows/solve-question-flow';
import { solveTextQuestionFlow } from '@/ai/flows/solve-text-question-flow';
import {
  SolveQuestionInput,
  SolveQuestionOutput,
  SolveTextQuestionInput,
} from '@/ai/schemas';

/**
 * A Server Action that calls the Genkit AI flow to solve a question from an image.
 * This is used by the web app for a more direct and efficient call.
 * @param input The question details, including the image data URI.
 * @returns The AI-generated solution or an error object.
 */
export async function solveQuestion(
  input: SolveQuestionInput
): Promise<SolveQuestionOutput | { error: string }> {
  try {
    // Call the Genkit flow directly.
    const result = await solveQuestionFlow(input);
    return result;
  } catch (e: any) {
    console.error('Server Action Error in solveQuestion:', e);
    // Return a serializable error object.
    return {
      error: e.message || 'An unexpected error occurred in the AI flow.',
    };
  }
}

/**
 * A Server Action that calls the Genkit AI flow to solve a question from text.
 * @param input The question details, including the question text.
 * @returns The AI-generated solution or an error object.
 */
export async function solveTextQuestion(
  input: SolveTextQuestionInput
): Promise<SolveQuestionOutput | { error: string }> {
  try {
    const result = await solveTextQuestionFlow(input);
    return result;
  } catch (e: any) {
    console.error('Server Action Error in solveTextQuestion:', e);
    return {
      error: e.message || 'An unexpected error occurred in the AI flow.',
    };
  }
}
