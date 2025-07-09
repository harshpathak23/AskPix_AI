/**
 * @fileoverview API route for solving questions from text.
 * This endpoint is used by the mobile app.
 */
import { NextResponse } from 'next/server';
import { solveTextQuestionFlow } from '@/ai/flows/solve-text-question-flow';
import { SolveTextQuestionInputSchema } from '@/ai/schemas';

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
    const body = await request.json();
    const validatedInput = SolveTextQuestionInputSchema.safeParse(body);

    if (!validatedInput.success) {
      return NextResponse.json(
        { error: 'Invalid input.', details: validatedInput.error.format() },
        { status: 400, headers: corsHeaders }
      );
    }

    const result = await solveTextQuestionFlow(validatedInput.data);
    return NextResponse.json(result, { headers: corsHeaders });
  } catch (e: any) {
    console.error(`API Route Error in /api/solve-text`, e);
    
    if (e.message && e.message.toLowerCase().includes('not found')) {
      return NextResponse.json(
        {
          error: `AI Model not found. This usually means the API key is missing, invalid, or does not have access to the required models. Please double-check your 'GENAI_API_KEY' in your Vercel project settings.`,
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
