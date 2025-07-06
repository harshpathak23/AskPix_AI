/**
 * @fileoverview This file defines the API route for solving questions.
 * This endpoint is specifically for the mobile app to communicate with the
 * server-side AI functionality. It receives a POST request, calls the
 * main `solveQuestion` server action, and returns the result as JSON.
 */
import { NextResponse } from 'next/server';
import { solveQuestion } from '@/app/actions';
import { SolveQuestionInputSchema } from '@/ai/schemas';

export async function POST(request: Request) {
  try {
    // 1. Parse and validate the incoming request body.
    const body = await request.json();
    const validatedInput = SolveQuestionInputSchema.safeParse(body);

    if (!validatedInput.success) {
      return NextResponse.json(
        { error: 'Invalid input.', details: validatedInput.error.format() },
        { status: 400 }
      );
    }

    // 2. Call the main server action with the validated data.
    const result = await solveQuestion(validatedInput.data);

    // 3. Check if the action returned an error.
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    // 4. Return the successful result.
    return NextResponse.json(result);
  } catch (e: any) {
    console.error('API Route Error:', e);
    return NextResponse.json(
      { error: e.message || 'An unexpected server error occurred.' },
      { status: 500 }
    );
  }
}
