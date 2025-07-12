
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
        videoEmbeddable: 'true',
      });

      const videos = searchResponse.data.items?.map(item => ({
        id: item.id?.videoId,
        thumbnail: item.snippet?.thumbnails?.high?.url,
      })).filter((video): video is { id: string, thumbnail: string } => !!video.id && !!video.thumbnail);

      if (!videos || videos.length === 0) {
        return {};
      }
      
      const videoIds = videos.map(v => v.id);

      // Now, check the status of these videos to find one that is truly available.
      const videoDetailsResponse = await youtube.videos.list({
        part: ['status'],
        id: videoIds,
      });

      const embeddableVideoId = videoDetailsResponse.data.items?.find(
        (video) => video.status?.embeddable === true && video.status?.privacyStatus === 'public'
      )?.id;
      
      if (embeddableVideoId) {
        const video = videos.find(v => v.id === embeddableVideoId);
        if (video) {
            return { videoId: video.id, videoThumbnail: video.thumbnail };
        }
      }

      // If no suitable video is found after checking details, return empty.
      return {};
    } catch (error) {
      console.error('Error searching YouTube:', error);
      // Don't throw an error, just return no videoId
      return {};
    }
  }
);
