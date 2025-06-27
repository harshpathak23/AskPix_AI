'use server';

import { z } from 'zod';
import { solveQuestion } from '@/ai/flows/solve-question';
import { identifySubject } from '@/ai/flows/identify-question-subject';
import type { SolveQuestionOutput, IdentifySubjectOutput } from '@/ai/schemas';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';


const QuestionSchema = z.object({
  photoDataUri: z.string().startsWith('data:image/', { message: "Invalid image format." }),
  language: z.enum(['en', 'hi']),
  subject: z.enum(['Mathematics', 'Physics', 'Chemistry', 'Biology', 'General']),
});

interface ActionState {
  error?: string | null;
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
    // First, identify the actual subject from the image
    const subjectDetectionResult = await identifySubject({ photoDataUri: validatedFields.data.photoDataUri });
    const identifiedSubject = subjectDetectionResult.subject;

    // Now, solve the question using the identified subject, ignoring the user's initial selection
    const result = await solveQuestion({ 
      ...validatedFields.data,
      subject: identifiedSubject // Use the AI-detected subject for accuracy
    });
    
    if (!result?.solution) {
      return { error: 'Could not generate a solution. Please try a different question or crop a different area.' };
    }
    
    // Return the solution, formulas, and the subject that was used to solve it
    return { 
        solution: result.solution,
        formulas: result.formulas || null,
        identifiedSubject: identifiedSubject,
    };

  } catch (e) {
    console.error(e);
    if (e instanceof Error) {
        if (e.message.includes('fetch failed')) {
            return { error: 'Could not connect to the AI service. Please ensure the server is running and try again.' };
        }
        return { error: e.message };
    }
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}


const SaveSolutionSchema = z.object({
  userId: z.string().min(1),
  croppedImage: z.string().startsWith('data:image/'),
  solution: z.string().min(1),
  formulas: z.string().optional().nullable(),
  subject: z.string(),
  identifiedSubject: z.string(),
  language: z.string(),
});

export async function saveSolution(data: z.infer<typeof SaveSolutionSchema>): Promise<{success?: boolean; error?: string}> {
    const validatedFields = SaveSolutionSchema.safeParse(data);

    if (!validatedFields.success) {
        console.error("SaveSolution validation error:", validatedFields.error.flatten());
        return { error: 'Invalid data provided for saving.' };
    }

    try {
        await addDoc(collection(db, 'solutions'), {
            ...validatedFields.data,
            createdAt: serverTimestamp(),
        });
        return { success: true };
    } catch(e) {
        console.error("Error saving solution to Firestore: ", e);
        if (e instanceof Error) {
            if (e.message.includes('permission-denied') || e.message.includes('PERMISSION_DENIED')) {
                 return { error: 'Permission denied. Please double-check your Firestore security rules to ensure they allow writes for authenticated users.' };
            }
            if (e.message.includes('longer than') && e.message.includes('bytes')) {
                return { error: 'Image file is too large to save. Please try cropping a smaller area.' };
            }
            if (e.message.includes('fetch failed')) {
                return { error: 'Could not connect to the database. Please check your network and Firebase setup.' };
            }
            return { error: `A database error occurred: ${e.message}` };
        }
        return { error: 'An unexpected error occurred while saving. Please try again.' };
    }
}
