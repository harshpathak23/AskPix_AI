/**
 * @fileoverview A browser-compatible mock for the 'genkit' package.
 * This mock provides the basic structure that the app expects on the client-side,
 * preventing crashes during static build while allowing server-only code to run on the server.
 * When AI functions are called on the client, they will controllably fail.
 */

// This function will be called on the client if an AI flow is triggered.
// It should never happen in a production environment with a server, but this
// prevents the app from crashing in a static/client-only environment.
const mockFlowRunner = async () => {
  console.error(
    'AI Action called on the client. This indicates a build configuration issue or a serverless environment.'
  );
  // Throw an error that can be caught by the calling function's try/catch block.
  throw new Error('AI functionality is not available in this environment.');
};

// The mock AI object mimics the structure of the real Genkit AI object.
const mockAi = {
  definePrompt: () => mockFlowRunner,
  // The flow definition itself can be a passthrough, as the prompt it calls is mocked.
  defineFlow: (config, fn) => fn,
};

// genkit() is a function that returns the AI object.
const genkit = () => mockAi;

module.exports = {
  genkit: genkit,
};
