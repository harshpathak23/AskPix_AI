// Note: The 'use server' directive has been removed.
// Server Actions are not compatible with the static export (`output: 'export'`)
// required for this application's build process. A different backend approach
// (like Firebase Functions) is needed to implement this functionality.

import { type SolveQuestionInput, type SolveQuestionOutput } from '@/ai/schemas';

export async function solveQuestion(input: SolveQuestionInput): Promise<SolveQuestionOutput> {
  throw new Error('AI feature is temporarily disabled. Server Actions are not supported in this app\'s build configuration.');
}
