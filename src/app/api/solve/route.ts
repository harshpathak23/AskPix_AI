/**
 * @fileoverview This file defines the API route for solving questions.
 * This endpoint is used by the web and mobile apps to communicate with the
 * server-side AI functionality. It receives a POST request, calls the
 * Genkit flow directly, and returns the result as JSON.
 */
import { NextResponse } from 'next/server';
import { solveQuestionFlow } from '@/ai/flows/solve-question-flow';
import { SolveQuestionInputSchema } from '@/ai/schemas';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS(request: Request) {
  return new NextResponse(null, {
    status: 204, // No Content
    headers: corsHeaders,
  });
}

export async function POST(request: Request) {
  try {
    // 1. Parse and validate the incoming request body.
    const body = await request.json();
    const validatedInput = SolveQuestionInputSchema.safeParse(body);

    if (!validatedInput.success) {
      return NextResponse.json(
        { error: 'Invalid input.', details: validatedInput.error.format() },
        { status: 400, headers: corsHeaders }
      );
    }

    // 2. Call the Genkit flow directly.
    const result = await solveQuestionFlow(validatedInput.data);
    return NextResponse.json(result, { headers: corsHeaders });
  } catch (e: any) {
    console.error('API Route Error in /api/solve:', e);
    // If the flow itself throws an error, or if there's another issue, catch it.
    return NextResponse.json(
      { error: e.message || 'An unexpected server error occurred.' },
      { status: 500, headers: corsHeaders }
    );
  }
}
