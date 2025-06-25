'use server';

import { z } from 'zod';
import { solveQuestion } from '@/ai/flows/solve-question';
import type { GraphData, SolveQuestionOutput } from '@/ai/schemas';

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
    const firstError = Object.values(validatedFields.error.flatten().fieldErrors)[0]?.[0] || 'Invalid input.';
    return {
      error: firstError,
    };
  }

  try {
    // Call the Genkit flow directly as a server function instead of using fetch.
    const result = await solveQuestion(validatedFields.data);
    
    if (!result?.solution) {
      return { error: 'Could not generate a solution. Please try a different question or crop a different area.' };
    }
    
    return { 
        solution: result.solution,
        graphData: result.graphData || null,
    };

  } catch (e) {
    console.error(e);
    if (e instanceof Error) {
        // Provide a more user-friendly message for network errors.
        if (e.message.includes('fetch failed')) {
            return { error: 'Could not connect to the AI service. Please ensure the server is running and try again.' };
        }
        return { error: e.message };
    }
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}
