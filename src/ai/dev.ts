import { config } from 'dotenv';
config();

// This file is used for the `npm run genkit:dev` command for isolated flow testing.
// With the `@genkit-ai/next` plugin, flows are loaded automatically within the Next.js app,
// so they do not need to be imported here for the main application to work.
