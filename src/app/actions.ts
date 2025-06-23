'use server';

import { solveQuestion } from '@/ai/flows/solve-question';
import { identifySubject } from '@/ai/flows/identify-question-subject';
import { z } from 'zod';

const QuestionSchema = z.object({
  photoDataUri: z.string().startsWith('data:image/', { message: "Invalid image format." }),
  language: z.enum(['en', 'hi']),
  subject: z.enum(['Mathematics', 'Physics', 'Chemistry', 'Biology']),
});

interface ActionState {
  error?: string | null;
  solutionSteps?: string[] | null;
  detectedSubject?: string | null;
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
    // 1. Identify the subject from the image
    const subjectResult = await identifySubject({
        photoDataUri: validatedFields.data.photoDataUri
    });
    
    let actualSubject = subjectResult.subject;
    const userSubject = validatedFields.data.subject;

    // If AI is unsure or gives a category we don't support (like 'General'), trust the user's choice.
    if (!['Mathematics', 'Physics', 'Chemistry', 'Biology'].includes(actualSubject)) {
        actualSubject = userSubject;
    }

    // 2. Call solveQuestion with the identified subject
    const result = await solveQuestion({
      photoDataUri: validatedFields.data.photoDataUri,
      language: validatedFields.data.language,
      subject: actualSubject,
    });
    
    if (!result.solutionSteps || result.solutionSteps.length === 0) {
      return { error: 'Could not generate a solution. Please try a different question.' };
    }
    
    // 3. Return solution and the detected subject
    return { 
        solutionSteps: result.solutionSteps,
        detectedSubject: actualSubject 
    };

  } catch (e) {
    console.error(e);
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}
