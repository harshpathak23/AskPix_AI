/**
 * @fileoverview Defines a Genkit tool for searching YouTube for educational videos.
 */
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { google } from 'googleapis';

const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY,
});

export const searchYouTube = ai.defineTool(
  {
    name: 'searchYouTube',
    description: 'Searches for a relevant educational YouTube video based on a query, language, and region.',
    inputSchema: z.object({
      query: z.string().describe('The search query for the video (e.g., "how to solve quadratic equations tutorial").'),
      language: z.enum(['en', 'hi']).describe('The language for the search results.'),
      regionCode: z.string().length(2).describe('The ISO 3166-1 alpha-2 country code (e.g., IN for India).'),
    }),
    outputSchema: z.object({
      videoId: z.string().optional().describe('The ID of the most relevant video found.'),
    }),
  },
  async ({ query, language, regionCode }) => {
    try {
      if (!process.env.YOUTUBE_API_KEY) {
        console.warn('YOUTUBE_API_KEY is not set. Skipping video search.');
        return {};
      }

      // Refine the query to be more specific for educational content.
      const refinedQuery = `${query} tutorial explanation class`;

      const response = await youtube.search.list({
        part: ['id'],
        q: refinedQuery,
        type: ['video'],
        maxResults: 5, // Get a few results to check for embeddable ones
        relevanceLanguage: language,
        regionCode: regionCode,
        videoCategoryId: '27', // Category for Education
        videoEmbeddable: 'true', // CRITICAL: Only search for videos that can be embedded.
      });

      const videoId = response.data.items?.[0]?.id?.videoId;
      if (videoId) {
        return { videoId };
      }
      return {};
    } catch (error) {
      console.error('Error searching YouTube:', error);
      // Don't throw an error, just return no videoId
      return {};
    }
  }
);
