/**
 * Anime Streaming Provider - Embedded Player Solution
 * 
 * Provides embed URLs that can be embedded via iframe in the app.
 * Falls back to new-tab links if iframe is blocked by CORS/CSP policies.
 */

export interface EmbedSource {
  name: string;
  embedUrl: string;
  type: "iframe" | "external";
  icon?: string;
}

/**
 * Get embed URLs for anime streaming
 * Returns multiple providers with both iframe-embeddable and external links
 */
export function getEmbedSources(animeId: number, episodeNumber: number): EmbedSource[] {
  const sources: EmbedSource[] = [];
  
  // Primary: GogoAnime-compatible iframe embed
  sources.push({
    name: "VidStream",
    embedUrl: `https://anitaku.to/embed-${animeId}-episode-${episodeNumber}`,
    type: "iframe",
  });
  
  // Secondary: DoodStream pattern (common anime host)
  sources.push({
    name: "DoodStream",
    embedUrl: `https://dood.ws/e/${animeId}${String(episodeNumber).padStart(3, "0")}`,
    type: "iframe",
  });
  
  // Fallback: External link (opens in new tab)
  sources.push({
    name: "Anitaku (External)",
    embedUrl: `https://anitaku.to/naruto-episode-${episodeNumber}`,
    type: "external",
  });
  
  return sources;
}

/**
 * Get the primary embed URL for an anime (iframe-embeddable)
 */
export function getPrimaryEmbedUrl(animeId: number, episodeNumber: number): string {
  // Use VidStream as primary - most compatible iframe embed
  return `https://anitaku.to/embed-${animeId}-episode-${episodeNumber}`;
}

/**
 * Get all embed sources with fallback for user selection
 */
export function getEmbedSourcesForEpisode(animeId: number, episodeNumber: number): EmbedSource[] {
  return getEmbedSources(animeId, episodeNumber);
}

/**
 * Legacy function - kept for compatibility
 * Returns embed URL instead of direct m3u8
 */
export async function getStreamUrl(animeId: number, episodeNumber: number): Promise<StreamSource[]> {
  const embedUrl = getPrimaryEmbedUrl(animeId, episodeNumber);
  
  return [{
    name: "VidStream",
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
  getEmbedSourcesForEpisode,
};