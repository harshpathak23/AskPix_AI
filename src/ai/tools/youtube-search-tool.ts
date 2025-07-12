
      
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
      videoThumbnail: z.string().optional().describe('The URL of the video thumbnail.'),
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

      const searchResponse = await youtube.search.list({
        part: ['id', 'snippet'],
        q: refinedQuery,
        type: ['video'],
        maxResults: 5, // Get a few results to check for embeddable ones
        relevanceLanguage: language,
        regionCode: regionCode,
        videoCategoryId: '27', // Category for Education
      });

      if (!searchResponse.data.items || searchResponse.data.items.length === 0) {
        console.log(`YouTube search returned no results for query: "${refinedQuery}"`);
        return {};
      }

      const videos = searchResponse.data.items.map(item => ({
        id: item.id?.videoId,
        thumbnail: item.snippet?.thumbnails?.high?.url,
      })).filter((video): video is { id: string, thumbnail: string } => !!video.id && !!video.thumbnail);
      
      if (!videos || videos.length === 0) {
        return {};
      }
      
      // Check the status of the videos to ensure they are public and embeddable.
      const videoIds = videos.map(v => v.id);
      const videoDetailsResponse = await youtube.videos.list({
        part: ['status'],
        id: videoIds,
      });

      const embeddableVideo = videoDetailsResponse.data.items?.find(item => item.status?.embeddable === true && item.status?.privacyStatus === 'public');

      if (embeddableVideo?.id) {
          const matchingVideo = videos.find(v => v.id === embeddableVideo.id);
          if (matchingVideo) {
              return { videoId: matchingVideo.id, videoThumbnail: matchingVideo.thumbnail };
          }
      }

      // If no suitable video is found, return empty.
      return {};

    } catch (error: any) {
      console.error('Error searching YouTube:', error.message);
      // Don't throw an error to the user, just return no videoId
      return {};
    }
  }
);

    