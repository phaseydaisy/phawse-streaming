"use client";

import { useState, useEffect } from "react";
import VideoPlayer from "@/components/VideoPlayer";
import EmbedPlayer from "@/components/EmbedPlayer";
import { getPrimaryEmbedUrl } from "@/lib/anime-provider";

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
  const [searchStatus, setSearchStatus] = useState<"idle" | "searching" | "found" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Search for streams when episode changes
  useEffect(() => {
    if (selectedEpisode) {
      searchStreams(selectedEpisode);
    }
  }, [selectedEpisode]);

  const searchStreams = async (episodeNum: number) => {
    setSearchStatus("searching");
    setErrorMessage("");

    try {
      // Generate embed URL directly (single provider)
      const embedUrl = getPrimaryEmbedUrl(animeId, episodeNum);
      setStreamUrl(embedUrl);
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

  const currentEpData = initialEpisodes.find(ep => ep.mal_id === currentEpisode);
  const currentIndex = initialEpisodes.findIndex(ep => ep.mal_id === currentEpisode);
  const displayEpisodeNumber = currentIndex + 1;

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
                  <p className="text-white text-lg mb-2">Searching for streams...</p>
                  <p className="text-gray-400 text-sm">Checking multiple sources</p>
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
                <div className="flex flex-col items-center justify-center bg-black/80 p-6">
                  <p className="text-white text-lg mb-4">Click below to watch Episode {currentEpisode}</p>
                  <a 
                    href={streamUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg text-white text-lg font-semibold"
                  >
                    🎬 Watch Now (Opens in new tab)
                  </a>
                  <p className="text-gray-400 text-sm mt-4">
                    If the link doesn't open, <button 
                      onClick={() => window.open(streamUrl, '_blank')}
                      className="text-purple-400 underline"
                    >
                      click here
                    </button>
                  </p>
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