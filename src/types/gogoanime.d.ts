declare module "gogoanime" {
  interface AnimeSearchResult {
    animeId: string;
    title: string;
    image: string;
    releaseDate?: string;
    status?: string;
    description?: string;
    genres?: string[];
  }

  interface Episode {
    episodeId: string;
    number: number;
    title?: string;
  }

  interface AnimeDetails {
    animeId: string;
    title: string;
    image: string;
    releaseDate?: string;
    status?: string;
    description?: string;
    genres?: string[];
    episodes?: Episode[];
  }

  interface StreamSource {
    url: string;
    quality: string;
    name?: string;
    isM3U8?: boolean;
  }

  interface EpisodeDetails {
    episodeId: string;
    number: number;
    title?: string;
    sources?: StreamSource[];
  }

  export function search(query: string): Promise<AnimeSearchResult[]>;
  export function getAnimeDetailsById(animeId: string): Promise<AnimeDetails>;
  export function getEpisodeDetails(episodeId: string): Promise<EpisodeDetails>;
}