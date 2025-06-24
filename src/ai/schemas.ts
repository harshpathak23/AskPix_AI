/**
 * @fileOverview This file contains all the Zod schemas and TypeScript types for the AI flows.
 * It is kept separate from the flow definitions to avoid issues with the 'use server' directive.
 */

import {z} from 'genkit';

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

export const GraphDataSchema = z.object({
  title: z.string().describe('A concise and descriptive title for the graph.'),
  data: z.array(z.object({
    name: z.string().describe("Label for the data point, typically shown on the x-axis."),
    value: z.number().describe("Numerical value for the data point, typically shown on the y-axis."),
  })).describe('An array of data points for the graph.'),
  xAxisLabel: z.string().describe('The label for the horizontal (X) axis.'),
  yAxisLabel: z.string().describe('The label for the vertical (Y) axis.'),
});
export type GraphData = z.infer<typeof GraphDataSchema>;

export const SolveQuestionOutputSchema = z.object({
  solution: z.string().describe('A single block of text containing a detailed, step-by-step solution. Use newline characters for paragraph breaks.'),
  graphData: z.optional(GraphDataSchema).describe('If the question is from Physics or Chemistry and a graph would help explain the solution, provide structured data for the graph here.'),
});
export type SolveQuestionOutput = z.infer<typeof SolveQuestionOutputSchema>;
