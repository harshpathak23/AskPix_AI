'use server';

import { solveQuestion } from '@/ai/flows/solve-question';
import { z } from 'zod';

const QuestionSchema = z.object({
  photoDataUri: z.string().startsWith('data:image/', { message: "Invalid image format." }),
  language: z.enum(['en', 'hi']),
});

interface ActionState {
  error?: string | null;
  solution?: string | null;
}

export async function getSolution(data: { photoDataUri: string, language: 'en' | 'hi' }): Promise<ActionState> {
  const validatedFields = QuestionSchema.safeParse(data);

  if (!validatedFields.success) {
    const firstError = validatedFields.error.flatten().fieldErrors.photoDataUri?.[0] 
      || validatedFields.error.flatten().fieldErrors.language?.[0]
      || 'Invalid input.';
    return {
      error: firstError,
    };
  }

  try {
    const result = await solveQuestion({
      photoDataUri: validatedFields.data.photoDataUri,
      language: validatedFields.data.language,
    });
    
    if (!result.solution) {
      return { error: 'Could not generate a solution. Please try a different question.' };
    }
    
    return { solution: result.solution };

  } catch (e) {
    console.error(e);
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}
