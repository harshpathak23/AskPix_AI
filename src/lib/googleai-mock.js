/**
 * @fileoverview A browser-compatible mock for the '@genkit-ai/googleai' package.
 * This mock provides a function that can be called without error on the client,
 * allowing the static build to succeed.
 */

// The googleAI() function is called to configure the plugin. In the mock,
// it doesn't need to do anything.
const googleAI = () => {
  return {
    // Return a simple object that represents a plugin.
    name: 'mock-google-ai',
  };
};

module.exports = {
  googleAI: googleAI,
};
