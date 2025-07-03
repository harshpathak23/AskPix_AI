import {genkit, type GenkitPlugin} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

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

export const ai = genkit({
  plugins: plugins,
});
