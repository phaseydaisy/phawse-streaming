"use client";

import { useState, useEffect } from "react";
import VideoPlayer from "@/components/VideoPlayer";
import EmbedPlayer from "@/components/EmbedPlayer";
import { getPrimaryEmbedUrl, getEmbedSources, type EmbedSource } from "@/lib/anime-provider";

interface Episode {
  mal_id: number;
  title: string;
  title_japanese?: string;
  aired: string;
  forum_url?: string;
  episode?: number; // Episode number from Jikan API
}

interface EpisodeListProps {
  animeId: number;
  animeTitle: string;
  initialEpisodes: Episode[];
  totalEpisodes?: number;
  trailerUrl?: string;
  posterUrl?: string;
}

export default function EpisodeList({ animeId, animeTitle, initialEpisodes, totalEpisodes, trailerUrl, posterUrl }: EpisodeListProps) {
  const [selectedEpisode, setSelectedEpisode] = useState<number | null>(null);
  const [currentEpisode, setCurrentEpisode] = useState<number>(1);
  const [streamUrl, setStreamUrl] = useState<string>("");
  const [embeds, setEmbeds] = useState<EmbedSource[]>([]);
  const [selectedEmbedIndex, setSelectedEmbedIndex] = useState<number>(0);
  const [searchStatus, setSearchStatus] = useState<"idle" | "searching" | "found" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [embedFailed, setEmbedFailed] = useState(false);

  // Search for streams when episode changes
  useEffect(() => {
    if (selectedEpisode) {
      searchStreams(selectedEpisode);
    }
  }, [selectedEpisode]);

  const searchStreams = async (episodeNum: number) => {
    setSearchStatus("searching");
    setErrorMessage("");
    setEmbedFailed(false);
    setSelectedEmbedIndex(0);

    try {
      // Get all available embed sources
      const embedSources = getEmbedSources(animeId, episodeNum);
      setEmbeds(embedSources);
      
      // Use the first iframe embed source by default
      const primaryEmbed = embedSources.find(e => e.type === "iframe") || embedSources[0];
      setStreamUrl(primaryEmbed.embedUrl);
      setSearchStatus("found");
    } catch (err) {
      setSearchStatus("error");
      setErrorMessage("Failed to load player. Please try again.");
    }
  };

  const handleEpisodeSelect = (episode: Episode) => {
    // Use episode number (1, 2, 3...) not mal_id
    const epNum = episode.episode || 1;
    setCurrentEpisode(epNum);
    setSelectedEpisode(epNum);
  };

  const goToPreviousEpisode = () => {
    const currentIndex = initialEpisodes.findIndex(ep => ep.mal_id === currentEpisode);
    if (currentIndex > 0) {
      handleEpisodeSelect(initialEpisodes[currentIndex - 1]);
    }
  };

  const goToNextEpisode = () => {
    const currentIndex = initialEpisodes.findIndex(ep => ep.mal_id === currentEpisode);
    const maxEpisodes = totalEpisodes || initialEpisodes.length;
    if (currentIndex < initialEpisodes.length - 1) {
      handleEpisodeSelect(initialEpisodes[currentIndex + 1]);
    } else if (currentIndex === initialEpisodes.length - 1 && initialEpisodes.length < maxEpisodes) {
      // If we have more episodes to fetch, could trigger fetch here
      console.log("More episodes may be available");
    }
  };

  const handleSwitchEmbed = (index: number) => {
    setSelectedEmbedIndex(index);
    setStreamUrl(embeds[index].embedUrl);
    setEmbedFailed(false);
  };

  const handleEmbedFailed = () => {
    setEmbedFailed(true);
  };

  const currentEpData = initialEpisodes.find(ep => ep.mal_id === currentEpisode);
  const currentIndex = initialEpisodes.findIndex(ep => ep.mal_id === currentEpisode);
  const displayEpisodeNumber = currentIndex + 1;
  const currentEmbed = embeds[selectedEmbedIndex];

  return (
    <div>
      {/* Video Player Section */}
      <div className="video-section mb-10">
        <div className="video-controls">
          <div className="flex items-center gap-4">
            <button 
              onClick={goToPreviousEpisode}
              disabled={currentIndex <= 0}
              className="episode-nav-btn"
            >
              ← Prev
            </button>
            <div>
              <span className="text-lg font-semibold">Episode {displayEpisodeNumber}</span>
              {currentEpData?.title && (
                <span className="text-gray-400 ml-2 text-sm">{currentEpData.title}</span>
              )}
            </div>
            <button 
              onClick={goToNextEpisode}
              disabled={currentIndex >= initialEpisodes.length - 1}
              className="episode-nav-btn"
            >
              Next →
            </button>
          </div>
          <button
            onClick={() => setSelectedEpisode(null)}
            className="text-gray-400 hover:text-white text-sm"
          >
            ✕ Close Player
          </button>
        </div>

        {/* Video Container */}
        <div className="video-container">
          {/* Show episode player when episode is selected */}
          {selectedEpisode && (
            <>
              {searchStatus === "searching" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-10">
                  <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-white text-lg mb-2">Loading streams...</p>
                  <p className="text-gray-400 text-sm">Checking available sources</p>
                </div>
              )}

              {searchStatus === "error" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-10 p-6">
                  <div className="text-red-400 text-4xl mb-4">⚠</div>
                  <p className="text-white text-lg mb-2">{errorMessage}</p>
                  <button 
                    onClick={() => searchStreams(currentEpisode)}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white text-sm"
                  >
                    Try Again
                  </button>
                </div>
              )}

              {searchStatus === "found" && streamUrl && (
                <div className="flex flex-col gap-4">
                  {/* Provider Selector (show if multiple providers available) */}
                  {embeds.length > 1 && (
                    <div className="flex gap-2 flex-wrap bg-black/40 p-4 rounded-lg">
                      {embeds.map((embed, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSwitchEmbed(idx)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                            selectedEmbedIndex === idx
                              ? "bg-purple-600 text-white"
                              : "bg-white/10 text-gray-300 hover:bg-white/20"
                          }`}
                        >
                          {embed.name}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Embed Player */}
                  {currentEmbed?.type === "iframe" && !embedFailed && (
                    <EmbedPlayer
                      embedUrl={streamUrl}
                      title={`${animeTitle} - Episode ${displayEpisodeNumber}`}
                      onFailed={handleEmbedFailed}
                    />
                  )}

                  {/* Fallback: External Link or Failed Embed */}
                  {(embedFailed || currentEmbed?.type === "external") && (
                    <div className="flex flex-col items-center justify-center bg-black/60 p-8 rounded-lg gap-4 min-h-[400px]">
                      <div className="text-5xl">🎬</div>
                      {embedFailed && (
                        <>
                          <p className="text-white text-lg">Player blocked by site restrictions</p>
                          <p className="text-gray-400 text-sm text-center">
                            The video player couldn't load. Open the stream in a new window instead.
                          </p>
                        </>
                      )}
                      {currentEmbed?.type === "external" && (
                        <>
                          <p className="text-white text-lg">Open in External Player</p>
                          <p className="text-gray-400 text-sm text-center">
                            Click the button below to watch this episode
                          </p>
                        </>
                      )}
                      <a
                        href={streamUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg text-white text-lg font-semibold"
                      >
                        Open Player (New Tab)
                      </a>

                      {/* Try other providers if embed failed */}
                      {embedFailed && embeds.length > 1 && (
                        <div className="mt-4 flex flex-col gap-2 w-full">
                          <p className="text-gray-400 text-sm">Try a different provider:</p>
                          <div className="flex gap-2 flex-wrap justify-center">
                            {embeds.map((embed, idx) => (
                              idx !== selectedEmbedIndex && (
                                <button
                                  key={idx}
                                  onClick={() => handleSwitchEmbed(idx)}
                                  className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-sm text-gray-300"
                                >
                                  {embed.name}
                                </button>
                              )
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Show trailer when no episode is selected */}
          {!selectedEpisode && trailerUrl && (
            <VideoPlayer 
              streamUrl={trailerUrl}
              poster={posterUrl}
              title={animeTitle}
              autoPlay={true}
            />
          )}

          {/* Show placeholder when no episode and no trailer */}
          {!selectedEpisode && !trailerUrl && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60">
              <div className="text-center">
                <div className="text-5xl mb-4">🎬</div>
                <p className="text-white text-lg">Select an episode to start watching</p>
                <p className="text-gray-400 text-sm mt-2">Click any episode below</p>
              </div>
            </div>
          )}
        </div>

        
      </div>

      {/* Episode Grid */}
      <div>
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <span>📺</span> All Episodes
          <span className="text-gray-400 text-sm font-normal ml-2">
            {totalEpisodes && totalEpisodes > initialEpisodes.length
              ? `(${initialEpisodes.length}/${totalEpisodes} episodes)`
              : `(${initialEpisodes.length} episodes)`}
          </span>
        </h3>
        
        <div className="episode-grid">
          {initialEpisodes.map((episode, index) => (
            <button
              key={episode.mal_id}
              onClick={() => handleEpisodeSelect(episode)}
              className={`episode-card ${
                selectedEpisode === episode.mal_id ? "active" : ""
              }`}
            >
              <div className="episode-number">Ep {index + 1}</div>
              <div className="episode-title">
                {episode.title || `Episode ${index + 1}`}
              </div>
            </button>
          ))}
        </div>

        {initialEpisodes.length === 0 && (
          <div className="text-center py-16" style={{ background: "var(--bg-secondary)", borderRadius: "16px" }}>
            <div className="text-4xl mb-4">📭</div>
            <p className="text-gray-400">No episodes available for this anime yet.</p>
            <p className="text-gray-500 text-sm mt-2">Check back later when new episodes air.</p>
          </div>
        )}
      </div>
    </div>
  );
}