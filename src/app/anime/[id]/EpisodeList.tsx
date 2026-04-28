"use client";

import { useState, useEffect } from "react";
import VideoPlayer from "@/components/VideoPlayer";

interface Episode {
  mal_id: number;
  title: string;
  title_japanese?: string;
  aired: string;
  forum_url?: string;
}

interface TorrentResult {
  name: string;
  magnet: string;
  size: string;
  seeds: number;
  leeches: number;
}

interface EpisodeListProps {
  animeId: number;
  animeTitle: string;
  initialEpisodes: Episode[];
}

export default function EpisodeList({ animeId, animeTitle, initialEpisodes }: EpisodeListProps) {
  const [selectedEpisode, setSelectedEpisode] = useState<number | null>(null);
  const [currentEpisode, setCurrentEpisode] = useState<number>(1);
  const [torrentUrl, setTorrentUrl] = useState<string>("");
  const [torrents, setTorrents] = useState<TorrentResult[]>([]);
  const [selectedTorrent, setSelectedTorrent] = useState<TorrentResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchStatus, setSearchStatus] = useState<"idle" | "searching" | "found" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Search for torrents when episode changes
  useEffect(() => {
    if (selectedEpisode) {
      searchTorrents(selectedEpisode);
    }
  }, [selectedEpisode]);

  const searchTorrents = async (episodeNum: number) => {
    setIsSearching(true);
    setSearchStatus("searching");
    setErrorMessage("");
    setTorrents([]);
    setSelectedTorrent(null);
    setTorrentUrl("");

    try {
      // Try multiple search queries for better results
      const queries = [
        `${animeTitle} Episode ${episodeNum} 1080p`,
        `${animeTitle} ${episodeNum} 1080p`,
        `${animeTitle} E${episodeNum}`,
      ];

      let foundTorrents: TorrentResult[] = [];

      for (const query of queries) {
        try {
          // Use local API route for dev, external for production
          const apiUrl = typeof window !== 'undefined' && window.location.hostname === 'localhost'
            ? `/api/search-torrent?q=${encodeURIComponent(query)}`
            : `/apiv1/search-torrent?q=${encodeURIComponent(query)}`;
          
          const response = await fetch(apiUrl);
          const data = await response.json();

          if (data.torrents && data.torrents.length > 0) {
            foundTorrents = data.torrents;
            break;
          } else if (data.magnet && foundTorrents.length === 0) {
            // Fallback to single magnet
            foundTorrents = [{
              name: data.name || query,
              magnet: data.magnet,
              size: data.size || "Unknown",
              seeds: 0,
              leeches: 0,
            }];
          }
        } catch (e) {
          console.log("Query failed:", query);
        }
      }

      if (foundTorrents.length > 0) {
        setTorrents(foundTorrents);
        setSelectedTorrent(foundTorrents[0]);
        setTorrentUrl(foundTorrents[0].magnet);
        setSearchStatus("found");
      } else {
        setSearchStatus("error");
        setErrorMessage("No torrents found. Try searching manually on Nyaa.si.");
      }
    } catch (err) {
      setSearchStatus("error");
      setErrorMessage("Failed to search for torrents. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleEpisodeSelect = (episode: Episode) => {
    setCurrentEpisode(episode.mal_id);
    setSelectedEpisode(episode.mal_id);
  };

  const handleTorrentSelect = (torrent: TorrentResult) => {
    setSelectedTorrent(torrent);
    setTorrentUrl(torrent.magnet);
  };

  const goToPreviousEpisode = () => {
    const currentIndex = initialEpisodes.findIndex(ep => ep.mal_id === currentEpisode);
    if (currentIndex > 0) {
      handleEpisodeSelect(initialEpisodes[currentIndex - 1]);
    }
  };

  const goToNextEpisode = () => {
    const currentIndex = initialEpisodes.findIndex(ep => ep.mal_id === currentEpisode);
    if (currentIndex < initialEpisodes.length - 1) {
      handleEpisodeSelect(initialEpisodes[currentIndex + 1]);
    }
  };

  const currentEpData = initialEpisodes.find(ep => ep.mal_id === currentEpisode);

  return (
    <div>
      {/* Video Player Section */}
      <div className="video-section mb-10">
        <div className="video-controls">
          <div className="flex items-center gap-4">
            <button 
              onClick={goToPreviousEpisode}
              disabled={currentEpisode <= Math.min(...initialEpisodes.map(e => e.mal_id))}
              className="episode-nav-btn"
            >
              ← Prev
            </button>
            <div>
              <span className="text-lg font-semibold">Episode {currentEpisode}</span>
              {currentEpData?.title && (
                <span className="text-gray-400 ml-2 text-sm">{currentEpData.title}</span>
              )}
            </div>
            <button 
              onClick={goToNextEpisode}
              disabled={currentEpisode >= Math.max(...initialEpisodes.map(e => e.mal_id))}
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
          {selectedEpisode && (
            <>
              {searchStatus === "searching" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-10">
                  <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-white text-lg mb-2">Searching for torrents...</p>
                  <p className="text-gray-400 text-sm">Checking multiple sources</p>
                </div>
              )}

              {searchStatus === "error" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-10 p-6">
                  <div className="text-red-400 text-4xl mb-4">⚠</div>
                  <p className="text-white text-lg mb-2">{errorMessage}</p>
                  <p className="text-gray-400 text-sm text-center mb-4">
                    You can try manually searching on Nyaa.si for "{animeTitle} Episode {currentEpisode}"
                  </p>
                  <button 
                    onClick={() => searchTorrents(currentEpisode)}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white text-sm"
                  >
                    Try Again
                  </button>
                </div>
              )}

              {searchStatus === "found" && torrentUrl && (
                <VideoPlayer 
                  torrentUrl={torrentUrl}
                  title={`${animeTitle} - Episode ${currentEpisode}`}
                />
              )}
            </>
          )}

          {!selectedEpisode && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60">
              <div className="text-center">
                <div className="text-5xl mb-4">🎬</div>
                <p className="text-white text-lg">Select an episode to start watching</p>
                <p className="text-gray-400 text-sm mt-2">Click any episode below</p>
              </div>
            </div>
          )}
        </div>

        {/* Torrent Selection */}
        {searchStatus === "found" && torrents.length > 1 && (
          <div className="mt-4 p-4 rounded-lg" style={{ background: "var(--bg-secondary)" }}>
            <p className="text-sm text-gray-400 mb-3">Select a different torrent:</p>
            <div className="flex flex-wrap gap-2">
              {torrents.slice(0, 5).map((torrent, index) => (
                <button
                  key={index}
                  onClick={() => handleTorrentSelect(torrent)}
                  className={`px-3 py-2 rounded-lg text-sm transition-all ${
                    selectedTorrent?.magnet === torrent.magnet
                      ? "bg-purple-600 text-white"
                      : "bg-white/10 hover:bg-white/20 text-gray-300"
                  }`}
                >
                  {torrent.name.slice(0, 40)}...
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Episode Grid */}
      <div>
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <span>📺</span> All Episodes
          <span className="text-gray-400 text-sm font-normal ml-2">({initialEpisodes.length} episodes)</span>
        </h3>
        
        <div className="episode-grid">
          {initialEpisodes.map((episode) => (
            <button
              key={episode.mal_id}
              onClick={() => handleEpisodeSelect(episode)}
              className={`episode-card ${
                selectedEpisode === episode.mal_id ? "active" : ""
              }`}
            >
              <div className="episode-number">Ep {episode.mal_id}</div>
              <div className="episode-title">
                {episode.title || `Episode ${episode.mal_id}`}
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