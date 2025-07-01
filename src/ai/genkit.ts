import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GEMINI_API_KEY,
      apiVersion: 'v1beta',
      model: 'gemini-2.0-flash',
      contextCaching: false,
    }),
  ],
});
