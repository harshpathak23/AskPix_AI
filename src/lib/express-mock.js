// A browser-compatible mock for the Express.js module.
// This allows Genkit's reflection/dev features to not crash in a browser environment.
module.exports = function() {
  // Return a mock app object with no-op methods
  return {
    use: function() {},
    get: function() {},
    post: function() {},
    listen: function() {},
  };
};
