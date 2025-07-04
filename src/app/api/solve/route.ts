
import { NextResponse, type NextRequest } from 'next/server';
import { solveQuestion } from '@/ai/flows/solve-question';
import { SolveQuestionInputSchema } from '@/ai/schemas';

// This is a public endpoint. For production, you would want to add authentication
// or an API key to prevent unauthorized use.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate the input against the Zod schema
    const validation = SolveQuestionInputSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input', details: validation.error.formErrors }, { status: 400 });
    }

    const input = validation.data;

    // Call the existing Genkit flow
    const result = await solveQuestion(input);

    return NextResponse.json(result);

  } catch (e) {
    console.error('API Error in /api/solve:', e);
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
    return NextResponse.json({ error: `Failed to process the request. ${errorMessage}` }, { status: 500 });
  }
}
