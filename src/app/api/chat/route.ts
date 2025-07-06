/**
 * @fileoverview This file defines the API route for the chat assistant.
 * It receives a POST request with a prompt, calls the chat assistant AI flow,
 * and returns the response as JSON.
 */
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { chatAssistantFlow } from '@/ai/flows/chat-assistant-flow';

const ChatRequestSchema = z.object({
  prompt: z.string(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedInput = ChatRequestSchema.safeParse(body);

    if (!validatedInput.success) {
      return NextResponse.json(
        { error: 'Invalid input.', details: validatedInput.error.format() },
        { status: 400 }
      );
    }

    const result = await chatAssistantFlow(validatedInput.data);
    return NextResponse.json(result);
  } catch (e: any) {
    console.error('API Route Error in /api/chat:', e);
    return NextResponse.json(
      { error: e.message || 'An unexpected server error occurred.' },
      { status: 500 }
    );
  }
}
