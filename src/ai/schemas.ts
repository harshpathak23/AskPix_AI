/**
 * @fileoverview This file defines the Zod schemas for the AI flows.
 * Schemas provide type safety and validation for the inputs and outputs of AI functions.
 * - SolveQuestionInputSchema: The input for the question-solving flow.
 * - SolveQuestionOutputSchema: The output from the question-solving flow.
 */
'use server';

import { z } from 'zod';

const SubjectsEnum = z.enum(['Mathematics', 'Physics', 'Chemistry', 'Biology', 'General']);

export const SolveQuestionInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of the question to solve, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  language: z.enum(['en', 'hi']).describe("The desired language for the solution."),
  subject: SubjectsEnum.describe("The user-selected subject for the question."),
});
export type SolveQuestionInput = z.infer<typeof SolveQuestionInputSchema>;

export const SolveQuestionOutputSchema = z.object({
  identifiedSubject: SubjectsEnum.describe("The subject of the question as identified by the AI."),
  topic: z.string().describe("The specific topic of the question (e.g., 'Quadratic Equations', 'Newton's Laws')."),
  solution: z
    .string()
    .describe(
      'A detailed, step-by-step solution to the problem in the specified language. Use Markdown for formatting and KaTeX for equations (e.g., $$E=mc^2$$ for block, $ax^2+bx+c=0$ for inline).'
    ),
  formulas: z
    .string()
    .optional()
    .describe('Any relevant formulas used in the solution, formatted with KaTeX.'),
});
export type SolveQuestionOutput = z.infer<typeof SolveQuestionOutputSchema>;
