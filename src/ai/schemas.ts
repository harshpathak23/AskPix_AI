/**
 * @fileOverview This file contains all the Zod schemas and TypeScript types for the AI flows.
 * It is kept separate from the flow definitions to avoid issues with the 'use server' directive.
 */

import {z} from 'zod';

// Schemas for solve-question.ts
export const SolveQuestionInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a question, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  subject: z
    .string()
    .optional()
    .describe('An optional hint for the subject of the question (e.g., Mathematics, Physics, Chemistry, Biology). The AI will determine the final subject.'),
  language: z
    .string()
    .describe('The language in which the solution should be provided. Options: en (English), hi (Hindi).')
    .default('en'),
});
export type SolveQuestionInput = z.infer<typeof SolveQuestionInputSchema>;

export const SolveQuestionOutputSchema = z.object({
  identifiedSubject: z.enum(['Mathematics', 'Physics', 'Chemistry', 'Biology', 'General']).describe('The subject identified by the AI from the image.'),
  topic: z.string().describe('A short, descriptive topic for the question in the requested language (e.g., "Pythagorean Theorem", "Stoichiometry"). This should be a title, not a full sentence.'),
  solution: z.string().describe('A single block of text containing a detailed, step-by-step solution. Use double newline characters for paragraph breaks.'),
  formulas: z.string().optional().describe('A block of text containing important formulas related to the topic, formatted in LaTeX. Each formula should be on a new line.'),
});
export type SolveQuestionOutput = z.infer<typeof SolveQuestionOutputSchema>;

// Schemas for assistant-flow.ts
export const AssistantInputSchema = z.object({
  prompt: z
    .string()
    .max(30000, { message: 'Input cannot exceed 30,000 characters.' })
    .describe('The user prompt for the assistant.'),
});
export type AssistantInput = z.infer<typeof AssistantInputSchema>;

export const AssistantOutputSchema = z.object({
  response: z.string().describe("The assistant's generated response."),
});
export type AssistantOutput = z.infer<typeof AssistantOutputSchema>;
