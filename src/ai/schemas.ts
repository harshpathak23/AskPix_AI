/**
 * @fileOverview This file contains all the Zod schemas and TypeScript types for the AI flows.
 * It is kept separate from the flow definitions to avoid issues with the 'use server' directive.
 */

import {z} from 'genkit';

// Schemas for identify-question-subject.ts
export const IdentifySubjectInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a question, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type IdentifySubjectInput = z.infer<typeof IdentifySubjectInputSchema>;

export const IdentifySubjectOutputSchema = z.object({
  subject: z.string().describe('The subject of the question (e.g., Mathematics, Physics, Chemistry, Biology, General).'),
});
export type IdentifySubjectOutput = z.infer<typeof IdentifySubjectOutputSchema>;


// Schemas for solve-question.ts
export const SolveQuestionInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a question, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  subject: z
    .string()
    .describe('The subject of the question (e.g., Mathematics, Physics, Chemistry, Biology).'),
  language: z
    .string()
    .describe('The language in which the solution should be provided. Options: en (English), hi (Hindi).')
    .default('en'),
});
export type SolveQuestionInput = z.infer<typeof SolveQuestionInputSchema>;

export const SolveQuestionOutputSchema = z.object({
  solutionSteps: z.array(z.string()).describe('An array of strings, where each string is a step in the solution.'),
});
export type SolveQuestionOutput = z.infer<typeof SolveQuestionOutputSchema>;

// Schemas for process-question-text.ts
export const ProcessQuestionTextInputSchema = z.object({
  questionText: z.string().describe('The text of the question to be processed.'),
  language: z.string().describe('The language in which the question is written.'),
});
export type ProcessQuestionTextInput = z.infer<typeof ProcessQuestionTextInputSchema>;

export const ProcessQuestionTextOutputSchema = z.object({
  subject: z.string().describe('The subject of the question (e.g., Mathematics, Physics, Chemistry, Biology, General).'),
});
export type ProcessQuestionTextOutput = z.infer<typeof ProcessQuestionTextOutputSchema>;
