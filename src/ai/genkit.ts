/**
 * @fileoverview This file initializes the Genkit AI instance.
 * It is configured to use the Google AI plugin. On the client-side (for static builds),
 * this is mocked to prevent crashes, while on the server, it uses the real implementation.
 */
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

// Initialize Genkit with the Google AI plugin.
// This `ai` object is used throughout the application to define and run AI flows.
export const ai = genkit({
  plugins: [
    googleAI({
      // An API key is required for the Google AI plugin.
      // It's loaded from the GENAI_API_KEY environment variable.
      apiKey: process.env.GENAI_API_KEY,
    }),
  ],
  // The log and flow state are stored in-memory.
  // For production, you might want to configure a persistent store.
  logStore: 'memory',
  flowStateStore: 'memory',
  traceStore: 'memory',
});
