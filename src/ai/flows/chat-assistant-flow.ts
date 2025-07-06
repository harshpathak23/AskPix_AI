'use server';
/**
 * @fileOverview Defines a simple chat assistant AI flow.
 *
 * - chatAssistantFlow - A function that takes a prompt and returns a text response.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';

const ChatAssistantInputSchema = z.object({
  prompt: z.string().describe('The user prompt to the assistant.'),
});

const ChatAssistantOutputSchema = z.object({
  response: z.string().describe('The text response from the assistant.'),
});

const chatAssistantPrompt = ai.definePrompt({
  name: 'chatAssistantPrompt',
  model: 'googleai/gemini-1.5-flash-latest',
  input: { schema: ChatAssistantInputSchema },
  output: { schema: ChatAssistantOutputSchema },
  prompt: `You are a helpful AI assistant. Respond to the following prompt concisely.
Format your response using Markdown. Use KaTeX for any mathematical notation.

Prompt:
{{{prompt}}}`,
});

export const chatAssistantFlow = ai.defineFlow(
  {
    name: 'chatAssistantFlow',
    inputSchema: ChatAssistantInputSchema,
    outputSchema: ChatAssistantOutputSchema,
  },
  async (input) => {
    const { output } = await chatAssistantPrompt(input);

    if (!output) {
      throw new Error('The AI failed to generate a response.');
    }

    return output;
  }
);
