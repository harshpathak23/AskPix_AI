'use server';
// This file is now designed to be run only on the server.
// The dynamic import in actions.ts ensures this code only runs when an action is called,
// not during the build process.

import { genkit, type GenkitPlugin } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

const plugins: GenkitPlugin[] = [];

if (process.env.GEMINI_API_KEY) {
  plugins.push(
    googleAI({
      apiKey: process.env.GEMINI_API_KEY,
      apiVersion: 'v1beta',
      contextCaching: false,
    })
  );
} else {
  console.warn(
    'GEMINI_API_KEY is not defined. Genkit will be initialized without the Google AI plugin.'
  );
}

// Initialize and export the AI instance directly.
export const ai = genkit({
  plugins: plugins,
});
