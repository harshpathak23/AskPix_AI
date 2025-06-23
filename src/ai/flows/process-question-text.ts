'use server';

/**
 * @fileOverview A question processor AI agent.
 *
 * - processQuestionText - A function that handles the question processing and subject determination.
 * - ProcessQuestionTextInput - The input type for the processQuestionText function.
 * - ProcessQuestionTextOutput - The return type for the processQuestionText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProcessQuestionTextInputSchema = z.object({
  questionText: z.string().describe('The text of the question to be processed.'),
  language: z.string().describe('The language in which the question is written.'),
});
export type ProcessQuestionTextInput = z.infer<typeof ProcessQuestionTextInputSchema>;

const ProcessQuestionTextOutputSchema = z.object({
  subject: z.string().describe('The subject of the question (e.g., Mathematics, Physics, Chemistry, General).'),
});
export type ProcessQuestionTextOutput = z.infer<typeof ProcessQuestionTextOutputSchema>;

export async function processQuestionText(input: ProcessQuestionTextInput): Promise<ProcessQuestionTextOutput> {
  return processQuestionTextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'processQuestionTextPrompt',
  input: {schema: ProcessQuestionTextInputSchema},
  output: {schema: ProcessQuestionTextOutputSchema},
  prompt: `You are an expert tutor specializing in Mathematics, Physics, and Chemistry.
  Your task is to determine the subject of a given question.

  Question: {{{questionText}}}
  Language: {{{language}}}

  Instructions:
  1. Analyze the question text to identify the subject.
  2. Determine the most appropriate subject from the following options: Mathematics, Physics, Chemistry, General.
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
    return output!;
  }
);
