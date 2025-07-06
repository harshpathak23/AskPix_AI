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
    const validatedInput = ChatRequestSchema.safeParse(body);

    if (!validatedInput.success) {
      return NextResponse.json(
        { error: 'Invalid input.', details: validatedInput.error.format() },
        { status: 400, headers: corsHeaders }
      );
    }

    const result = await chatAssistantFlow(validatedInput.data);
    return NextResponse.json(result, { headers: corsHeaders });
  } catch (e: any) {
    console.error('API Route Error in /api/chat:', e);
    
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
