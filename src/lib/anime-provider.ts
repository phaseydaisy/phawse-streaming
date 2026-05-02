/**
 * Anime Streaming Provider - External Link Solution
 * 
 * Opens streaming sites in new tabs since most block iframe embedding.
 * Uses anitaku.to (gogoanime) which is a popular anime streaming site.
 */

export interface EmbedSource {
  name: string;
  embedUrl: string;
  icon?: string;
}

/**
 * Get embed URLs for anime streaming
 * Uses anitaku.to which opens in new tab
 */
export function getEmbedSources(animeId: number, episodeNumber: number): EmbedSource[] {
  const sources: EmbedSource[] = [];
  
  // Anitaku - opens in new tab
  sources.push({
    name: "Anitaku",
    embedUrl: `https://anitaku.to/naruto-episode-${episodeNumber}`,
  });
  
  return sources;
}

/**
 * Get the primary embed URL for an anime
 * Opens in new tab instead of embedding
 */
export function getPrimaryEmbedUrl(animeId: number, episodeNumber: number): string {
  // Use anitaku.to - opens in new tab
  return `https://anitaku.to/naruto-episode-${episodeNumber}`;
}

/**
 * Legacy function - kept for compatibility
 * Returns embed URL instead of direct m3u8
 */
export async function getStreamUrl(animeId: number, episodeNumber: number): Promise<StreamSource[]> {
  const embedUrl = getPrimaryEmbedUrl(animeId, episodeNumber);
  
  return [{
    name: "VidSrc",
    url: embedUrl,
    quality: "auto",
    isM3U8: false, // It's an embed, not direct m3u8
  }];
}

export interface StreamSource {
  name: string;
  url: string;
  quality: string;
  isM3U8: boolean;
}

export interface EpisodeInfo {
  number: number;
  title: string;
  url: string;
}

export default {
  getStreamUrl,
  getPrimaryEmbedUrl,
  getEmbedSources,
};