// A browser-compatible mock for Node.js's async_hooks.AsyncLocalStorage.
// This allows Genkit's flow state management to not crash in a browser environment,
// though context will not actually be carried across async operations.
// This is necessary for building a static Next.js app that uses Genkit on the client.
class AsyncLocalStorage {
  run(store, callback, ...args) {
    try {
      this._store = store;
      return callback(...args);
    } finally {
      this._store = undefined;
    }
  }

  getStore() {
    return this._store;
  }
}

module.exports = {
  AsyncLocalStorage: AsyncLocalStorage,
};
