// This file is now designed to be run only on the server.
// The webpack alias in next.config.js prevents it from being included in the client bundle.

import { genkit, type Genkit, type GenkitPlugin } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

let aiInstance: Genkit | null = null;

/**
 * Initializes and returns the Genkit instance.
 * It's cached to avoid re-initialization on every call.
 * This function should only ever be called in a server environment.
 * @returns {Genkit} The initialized Genkit instance.
 */
export function getGenkit(): Genkit {
  if (aiInstance) {
    return aiInstance;
  }

  const plugins: GenkitPlugin[] = [];

  if (process.env.GEMINI_API_KEY) {
    plugins.push(
      googleAI({
        apiKey: process.env.GEMINI_API_KEY,
        apiVersion: 'v1beta',
        model: 'gemini-2.0-flash',
        contextCaching: false,
      })
    );
  } else {
    console.warn(
      'GEMINI_API_KEY is not defined. Genkit will be initialized without the Google AI plugin.'
    );
  }

  aiInstance = genkit({
    plugins: plugins,
  });

  return aiInstance;
}
