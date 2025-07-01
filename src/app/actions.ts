'use server';

import { z } from 'zod';
import { solveQuestion } from '@/ai/flows/solve-question';

const QuestionSchema = z.object({
  photoDataUri: z.string().startsWith('data:image/', { message: "Invalid image format." }),
  language: z.enum(['en', 'hi']),
  subject: z.enum(['Mathematics', 'Physics', 'Chemistry', 'Biology', 'General']),
});

interface ActionState {
  error?: string | null;
  topic?: string | null;
  solution?: string | null;
  formulas?: string | null;
  identifiedSubject?: 'Mathematics' | 'Physics' | 'Chemistry' | 'Biology' | 'General' | null;
}

export async function getSolution(data: { photoDataUri: string, language: 'en' | 'hi', subject: 'Mathematics' | 'Physics' | 'Chemistry' | 'Biology' | 'General' }): Promise<ActionState> {
  const validatedFields = QuestionSchema.safeParse(data);

  if (!validatedFields.success) {
    const firstError = Object.values(validatedFields.error.flatten().fieldErrors)[0]?.[0] || 'Invalid input.';
    return {
      error: firstError,
    };
  }

  try {
    // Call the single, powerful solveQuestion flow
    // We pass the user's selected subject as an optional hint
    const result = await solveQuestion(validatedFields.data);
    
    if (!result?.solution || !result?.topic || !result.identifiedSubject) {
      return { error: 'Could not generate a solution. Please try a different question or crop a different area.' };
    }
    
    // Return all the data from the single flow
    return { 
        topic: result.topic,
        solution: result.solution,
        formulas: result.formulas || null,
        identifiedSubject: result.identifiedSubject,
    };

  } catch (e) {
    console.error(e);
    if (e instanceof Error) {
        if (e.message.includes('fetch failed')) {
            return { error: 'Could not connect to the AI service. Please ensure the server is running and try again.' };
        }
        if (e.message.includes('permission-denied') || e.message.includes('PERMISSION_DENIED')) {
             return { error: 'Permission denied. Please double-check your Firestore security rules to ensure they allow writes for authenticated users.' };
        }
        if (e.message.includes('longer than') && e.message.includes('bytes')) {
            return { error: 'Image file is too large to save. Please try cropping a smaller area.' };
        }
        return { error: e.message };
    }
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}
