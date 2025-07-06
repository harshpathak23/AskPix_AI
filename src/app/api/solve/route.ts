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
    
    // Check for a "Model not found" error to provide a more specific message.
    if (e.message && e.message.toLowerCase().includes('not found')) {
      return NextResponse.json(
        {
          error: `AI Model not found. This usually means the API key is missing, invalid, or does not have access to the required models. Please double-check your 'GENAI_API_KEY' in your Vercel project settings and ensure the Google AI (Generative Language) API is enabled in your Google Cloud project.`,
        },
        { status: 500, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { error: e.message || 'An unexpected server error occurred.' },
      { status: 500, headers: corsHeaders }
    );
  }
}
