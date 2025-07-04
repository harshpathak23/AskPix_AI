import type { Genkit, GenkitPlugin } from 'genkit';

// Cached instance to avoid re-initialization on every call in the same server instance.
let aiInstance: Genkit | null = null;

/**
 * Initializes the Genkit instance on demand.
 * This "lazy loading" of the core 'genkit' package itself is critical to prevent
 * its server-only code from running during the Next.js build process (`next build`),
 * which would cause a crash in a static export setup.
 * The Genkit instance is cached after the first call.
 * @returns {Promise<Genkit>} A promise that resolves to the initialized Genkit instance.
 */
export async function getGenkit(): Promise<Genkit> {
  if (aiInstance) {
    return aiInstance;
  }

  // Lazily import the genkit package itself to prevent its code from running at build time.
  const { genkit } = await import('genkit');
  const plugins: GenkitPlugin[] = [];

  if (process.env.GEMINI_API_KEY) {
    // Dynamically import the googleAI plugin only when needed.
    // This prevents the server-only package from being bundled in the client build.
    const { googleAI } = await import('@genkit-ai/googleai');
    plugins.push(
      googleAI({
        apiKey: process.env.GEMINI_API_KEY,
        apiVersion: 'v1beta',
        model: 'gemini-2.0-flash',
        contextCaching: false,
      })
    );
  } else {
    // This warning is crucial for debugging in a local dev environment.
    console.warn(
      'GEMINI_API_KEY is not defined. Genkit will be initialized without the Google AI plugin.'
    );
  }

  aiInstance = genkit({
    plugins: plugins,
  });

  return aiInstance;
}
