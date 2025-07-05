'use server';
/**
 * @fileOverview A Gemini Pro assistant that handles large text inputs.
 *
 * - chatWithAssistant - The function to call to execute the assistant flow.
 */

import {
  AssistantInputSchema,
  type AssistantInput,
  AssistantOutputSchema,
  type AssistantOutput,
} from '@/ai/schemas';
import { ai } from '@/ai/genkit';

const assistantPrompt = ai.definePrompt({
  name: 'assistantPrompt',
  model: 'googleai/gemini-pro',
  input: { schema: AssistantInputSchema },
  output: {
    format: 'json',
    schema: AssistantOutputSchema,
  },
  config: {
    temperature: 0.7,
  },
  prompt: `You are a helpful assistant. The user has provided the following text. Please provide a useful and concise response.

User Prompt:
{{{prompt}}}
`,
});

const assistantFlow = ai.defineFlow(
  {
    name: 'assistantFlow',
    inputSchema: AssistantInputSchema,
    outputSchema: AssistantOutputSchema,
  },
  async (input: AssistantInput): Promise<AssistantOutput> => {
    const { output } = await assistantPrompt(input);
    if (!output) {
      throw new Error('The AI could not generate a response. Please try again.');
    }
    return { response: output.response };
  }
);

/**
 * The main exported function to run the assistant flow.
 * @param input The user's prompt.
 * @returns The assistant's response.
 */
export async function chatWithAssistant(input: AssistantInput): Promise<AssistantOutput> {
  return assistantFlow(input);
}
