/**
 * @fileoverview A browser-compatible mock for the 'genkit' package.
 * This mock provides the basic structure that the app expects on the client-side,
 * preventing crashes during static build while allowing server-only code to run on the server.
 * When AI functions are called on the client, they will controllably fail with a clear error.
 */

// This is the mock 'ai' object that will be used on the client.
const mockAi = {
  // Mock for ai.definePrompt()
  definePrompt: (config) => {
    // Return a function that, when called, immediately throws a catchable error.
    return async (input) => {
      console.error(
        'AI Action called on the client. This indicates a build configuration issue or a serverless environment.'
      );
      throw new Error(
        'AI functionality is not available in this environment.'
      );
    };
  },
  // Mock for ai.defineFlow()
  defineFlow: (config, flowFn) => {
    // Return a function that wraps the original flow function.
    // When this is called, it will execute the flow, which in turn will call our mocked prompt and throw the error.
    return async (input) => {
      return await flowFn(input);
    };
  },
};

// Mock for the top-level genkit() function.
const genkit = (config) => {
  // It is called in src/ai/genkit.ts and must return the mock 'ai' object.
  return mockAi;
};

// Export the mock function, which is what the real 'genkit' package does.
module.exports = {
  genkit: genkit,
};
