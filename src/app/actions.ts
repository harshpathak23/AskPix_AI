'use server';

import { solveQuestion } from '@/ai/flows/solve-question';
import { z } from 'zod';
import type { GraphData } from '@/ai/schemas';

const QuestionSchema = z.object({
  photoDataUri: z.string().startsWith('data:image/', { message: "Invalid image format." }),
  language: z.enum(['en', 'hi']),
  subject: z.enum(['Mathematics', 'Physics', 'Chemistry', 'Biology']),
});

interface ActionState {
  error?: string | null;
  solution?: string | null;
  graphData?: GraphData | null;
}

export async function getSolution(data: { photoDataUri: string, language: 'en' | 'hi', subject: 'Mathematics' | 'Physics' | 'Chemistry' | 'Biology' }): Promise<ActionState> {
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
    // Call solveQuestion directly with the user-provided subject for faster response
    const result = await solveQuestion({
      photoDataUri: validatedFields.data.photoDataUri,
      language: validatedFields.data.language,
      subject: validatedFields.data.subject,
    });
    
    if (!result.solution) {
      return { error: 'Could not generate a solution. Please try a different question.' };
    }
    
    // Return solution
    return { 
        solution: result.solution,
        graphData: result.graphData || null,
    };

  } catch (e) {
    console.error(e);
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}
