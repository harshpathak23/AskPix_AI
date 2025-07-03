'use server';

/**
 * @fileOverview A question processor AI agent.
 *
 * - processQuestionText - A function that handles the question processing and subject determination.
 */

import {ai} from '@/ai/genkit';
import {
  ProcessQuestionTextInputSchema,
  type ProcessQuestionTextInput,
  ProcessQuestionTextOutputSchema,
  type ProcessQuestionTextOutput,
} from '@/ai/schemas';

export async function processQuestionText(input: ProcessQuestionTextInput): Promise<ProcessQuestionTextOutput> {
  return processQuestionTextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'processQuestionTextPrompt',
  model: 'googleai/gemini-2.0-flash',
  input: {schema: ProcessQuestionTextInputSchema},
  output: {schema: ProcessQuestionTextOutputSchema},
  prompt: `You are an expert tutor specializing in Mathematics, Physics, Chemistry, and Biology.
  Your task is to determine the subject of a given question.

  Question: {{{questionText}}}
  Language: {{{language}}}

  Instructions:
  1. Analyze the question text to identify the subject.
  2. Determine the most appropriate subject from the following options: Mathematics, Physics, Chemistry, Biology, General.
  3. Return the subject in the output.
  `,
});

const processQuestionTextFlow = ai.defineFlow(
  {
    name: 'processQuestionTextFlow',
    inputSchema: ProcessQuestionTextInputSchema,
    outputSchema: ProcessQuestionTextOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('Failed to process the question text. The AI could not generate a response.');
    }
    return output;
  }
);
