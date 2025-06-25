import {config} from 'dotenv';
config();

import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {next} from '@genkit-ai/next';

export const ai = genkit({
  plugins: [
    next({
      // This integrates Genkit flows directly into the Next.js server,
      // making them available at /api/genkit/*
    }),
    googleAI({
      apiKey: process.env.GEMINI_API_KEY,
    }),
  ],
});
