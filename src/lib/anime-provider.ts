/**
 * Anime Streaming Provider - Embedded Player Solution
 * 
 * Provides embed URLs that can be embedded via iframe in the app.
 * Falls back to new-tab links if iframe is blocked by CORS/CSP policies.
 * 
 * Updated to use providers from https://theindex.moe/library/anime
 * Sources: Anime Nexus, 1anime, AniGO, AniKage, Anilab
 */

export interface EmbedSource {
  name: string;
  embedUrl: string;
  type: "iframe" | "external";
  icon?: string;
}

/**
 * Get embed URLs for anime streaming
 * Returns multiple providers with direct video iframe embeds from theindex.moe
 */
export function getEmbedSources(animeId: number, episodeNumber: number): EmbedSource[] {
  const sources: EmbedSource[] = [];

  // Primary: Anime Nexus - Ad-free 1080p anime streaming
  sources.push({
    name: "Anime Nexus",
    embedUrl: `https://anime.nexus/embed/${animeId}?ep=${episodeNumber}`,
    type: "iframe",
  });

  // Secondary: 1anime - No Watermark, 1080p
  sources.push({
    name: "1anime",
    embedUrl: `https://1anime.app/embed/${animeId}?ep=${episodeNumber}`,
    type: "iframe",
  });

  // Tertiary: AniGO - No Ads, multi-language
  sources.push({
    name: "AniGO",
    embedUrl: `https://anigo.to/embed/${animeId}?ep=${episodeNumber}`,
    type: "iframe",
  });

  // Quaternary: AniKage - No Ads No Watermark
  sources.push({
    name: "AniKage",
    embedUrl: `https://anikage.cc/embed/${animeId}?ep=${episodeNumber}`,
    type: "iframe",
  });

  // Quinary: Anilab - Mobile Responsive
  sources.push({
    name: "Anilab",
    embedUrl: `https://anilab.to/embed/${animeId}?ep=${episodeNumber}`,
    type: "iframe",
  });

  // Fallback: External link (opens in new tab)
  sources.push({
    name: "External Player",
    embedUrl: `https://anime.nexus/watch/${animeId}?ep=${episodeNumber}`,
    type: "external",
  });

  return sources;
}

/**
 * Get the primary embed URL for an anime (iframe-embeddable)
 * Using Anime Nexus as primary from theindex.moe
 */
export function getPrimaryEmbedUrl(animeId: number, episodeNumber: number): string {
  // Use Anime Nexus as primary - ad-free 1080p streaming
  return `https://anime.nexus/embed/${animeId}?ep=${episodeNumber}`;
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
    name: "Anime Nexus",
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