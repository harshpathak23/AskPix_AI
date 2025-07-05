import { solveQuestion as solveQuestionFlow } from '@/ai/flows/solve-question';
import { type SolveQuestionInput, type SolveQuestionOutput } from '@/ai/schemas';
import { chatWithAssistant as assistantFlow } from '@/ai/flows/assistant-flow';
import { type AssistantInput, type AssistantOutput } from '@/ai/schemas';

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

/**
 * Calls the Genkit flow for the text-based assistant.
 * @param input The user prompt.
 * @returns The assistant response.
 */
export async function chatWithAssistant(input: AssistantInput): Promise<AssistantOutput> {
  return assistantFlow(input);
}
