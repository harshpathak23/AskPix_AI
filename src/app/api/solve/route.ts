
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { solveQuestion } from '@/ai/flows/solve-question';

const QuestionSchema = z.object({
  photoDataUri: z.string().startsWith('data:image/', { message: "Invalid image format." }),
  language: z.enum(['en', 'hi']),
  subject: z.enum(['Mathematics', 'Physics', 'Chemistry', 'Biology', 'General']),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedFields = QuestionSchema.safeParse(body);

    if (!validatedFields.success) {
      const firstError = Object.values(validatedFields.error.flatten().fieldErrors)[0]?.[0] || 'Invalid input.';
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const result = await solveQuestion(validatedFields.data);

    if (!result?.solution || !result?.topic || !result.identifiedSubject) {
      return NextResponse.json({ error: 'Could not generate a solution. Please try a different question or crop a different area.' }, { status: 500 });
    }

    return NextResponse.json({ 
        topic: result.topic,
        solution: result.solution,
        formulas: result.formulas || null,
        identifiedSubject: result.identifiedSubject,
    });

  } catch (e) {
    console.error(e);
    let errorMessage = 'An unexpected error occurred. Please try again.';
    let statusCode = 500;
    if (e instanceof Error) {
        if (e.message.includes('fetch failed')) {
            errorMessage = 'Could not connect to the AI service. Please ensure the server is running and try again.';
        } else if (e.message.includes('permission-denied') || e.message.includes('PERMISSION_DENIED')) {
             errorMessage = 'Permission denied. Please double-check your Firestore security rules.';
        } else if (e.message.includes('longer than') && e.message.includes('bytes')) {
            errorMessage = 'Image file is too large to save. Please try cropping a smaller area.';
        } else {
            errorMessage = e.message;
        }
    }
    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}
