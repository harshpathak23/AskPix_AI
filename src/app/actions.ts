'use server';

import { identifySubject } from '@/ai/flows/identify-question-subject';
import { solveQuestion } from '@/ai/flows/solve-question';
import { z } from 'zod';
import type { GraphData } from '@/ai/schemas';

const QuestionSchema = z.object({
  photoDataUri: z.string().startsWith('data:image/', { message: "Invalid image format." }),
  language: z.enum(['en', 'hi']),
});

interface ActionState {
  error?: string | null;
  solution?: string | null;
  graphData?: GraphData | null;
}

export async function getSolution(data: { photoDataUri: string, language: 'en' | 'hi', subject: 'Mathematics' | 'Physics' | 'Chemistry' | 'Biology' }): Promise<ActionState> {
  const validatedFields = QuestionSchema.safeParse({
    photoDataUri: data.photoDataUri,
    language: data.language,
  });

  if (!validatedFields.success) {
    const firstError = validatedFields.error.flatten().fieldErrors.photoDataUri?.[0] 
      || validatedFields.error.flatten().fieldErrors.language?.[0]
      || 'Invalid input.';
    return {
      error: firstError,
    };
  }

  try {
    // 1. Identify the subject from the image for a more accurate result.
    const { subject: identifiedSubject } = await identifySubject({
      photoDataUri: validatedFields.data.photoDataUri,
    });
    
    const finalSubject = identifiedSubject || data.subject; // Fallback to user-selected subject

    // 2. Call solveQuestion with the determined subject.
    const result = await solveQuestion({
      photoDataUri: validatedFields.data.photoDataUri,
      language: validatedFields.data.language,
      subject: finalSubject,
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
