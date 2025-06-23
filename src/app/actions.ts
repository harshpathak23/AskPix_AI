'use server';

import { solveQuestion } from '@/ai/flows/solve-question';
import { z } from 'zod';

const QuestionSchema = z.object({
  photoDataUri: z.string().startsWith('data:image/', { message: "Invalid image format." }),
  language: z.enum(['en', 'hi']),
  subject: z.enum(['Mathematics', 'Physics', 'Chemistry']),
});

interface ActionState {
  error?: string | null;
  solutionSteps?: string[] | null;
}

export async function getSolution(data: { photoDataUri: string, language: 'en' | 'hi', subject: 'Mathematics' | 'Physics' | 'Chemistry' }): Promise<ActionState> {
  const validatedFields = QuestionSchema.safeParse(data);

  if (!validatedFields.success) {
    const firstError = validatedFields.error.flatten().fieldErrors.photoDataUri?.[0] 
      || validatedFields.error.flatten().fieldErrors.language?.[0]
      || validatedFields.error.flatten().fieldErrors.subject?.[0]
      || 'Invalid input.';
    return {
      error: firstError,
    };
  }

  try {
    const result = await solveQuestion({
      photoDataUri: validatedFields.data.photoDataUri,
      language: validatedFields.data.language,
      subject: validatedFields.data.subject,
    });
    
    if (!result.solutionSteps || result.solutionSteps.length === 0) {
      return { error: 'Could not generate a solution. Please try a different question.' };
    }
    
    return { solutionSteps: result.solutionSteps };

  } catch (e) {
    console.error(e);
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}
