'use server';

/**
 * @fileOverview An AI agent that identifies the subject of a question from an image.
 *
 * - identifySubject - A function that handles the subject identification process.
 */

import {ai} from '@/ai/genkit';
import {
  IdentifySubjectInputSchema,
  type IdentifySubjectInput,
  IdentifySubjectOutputSchema,
  type IdentifySubjectOutput,
} from '@/ai/schemas';

export async function identifySubject(input: IdentifySubjectInput): Promise<IdentifySubjectOutput> {
  return identifySubjectFlow(input);
}

const prompt = ai.definePrompt({
  name: 'identifySubjectPrompt',
  input: {schema: IdentifySubjectInputSchema},
  output: {schema: IdentifySubjectOutputSchema},
  model: 'googleai/gemini-1.5-flash',
  prompt: `You are an expert at identifying the subject of academic questions.
  Analyze the provided image and determine its subject.
  The possible subjects are: Mathematics, Physics, Chemistry, Biology, General.

  Image: {{media url=photoDataUri}}

  Return only the subject name in the output.`,
});


const identifySubjectFlow = ai.defineFlow(
  {
    name: 'identifySubjectFlow',
    inputSchema: IdentifySubjectInputSchema,
    outputSchema: IdentifySubjectOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
