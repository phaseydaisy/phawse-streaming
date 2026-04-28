"use client";

import { useRef, useEffect, useState } from "react";
import WebTorrent from "webtorrent";

interface VideoPlayerProps {
  torrentUrl: string;
  poster?: string;
  title?: string;
  onEnded?: () => void;
  onTimeUpdate?: (currentTime: number) => void;
  initialTime?: number;
  autoPlay?: boolean;
}

const VideoPlayer = ({
  torrentUrl,
  poster,
  title,
  onEnded,
  onTimeUpdate,
  initialTime = 0,
  autoPlay = false,
}: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const clientRef = useRef<WebTorrent.Instance | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [downloadSpeed, setDownloadSpeed] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [peerCount, setPeerCount] = useState(0);

  useEffect(() => {
    // Initialize WebTorrent client with multiple trackers for better peer discovery
    if (!clientRef.current) {
      clientRef.current = new WebTorrent({
        tracker: {
          wss: "wss://tracker.openwebtorrent.com",
          ws: "wss://tracker.baka.xyz:443",
        },
        // More aggressive peer connections
        maxConns: 100,
      });
    }

    const client = clientRef.current;

    // Add torrent
    if (torrentUrl) {
      setIsLoading(true);
      setError(null);
      setProgress(0);

      // Check if it's a magnet link or torrent file
      if (torrentUrl.startsWith("magnet:")) {
        client.add(torrentUrl, { path: "/tmp" }, (torrent) => {
          handleTorrent(torrent);
        });
      } else if (torrentUrl.endsWith(".torrent")) {
        client.add(torrentUrl, (torrent) => {
          handleTorrent(torrent);
        });
      } else {
        setError("Invalid torrent URL. Use a magnet link or .torrent file.");
        setIsLoading(false);
      }
    }

    function handleTorrent(torrent: WebTorrent.Torrent) {
      // Log peer status for debugging
      torrent.on("warning", (err) => {
        console.warn("Torrent warning:", err);
      });
      
      torrent.on("error", (err) => {
        console.error("Torrent error:", err);
        setError("Connection error. Trying to reconnect...");
      });

      // Find the largest video file, fallback to first file
      const videoFile = torrent.files.find((file) =>
        file.name.match(/\.(mp4|mkv|avi|mov|webm)$/i)
      ) || torrent.files[0];

      if (!videoFile) {
        setError("No video file found in this torrent.");
        setIsLoading(false);
        return;
      }

      // Stream to video element using appendTo
      const parentElement = videoRef.current?.parentElement;
      if (parentElement) {
        videoFile.appendTo(parentElement, (err, elem) => {
          if (!err) {
            setIsReady(true);
            setIsLoading(false);
            if (initialTime > 0 && videoRef.current) {
              videoRef.current.currentTime = initialTime;
            }
            if (autoPlay) {
              videoRef.current?.play();
            }
          }
        });
      }

      // Update progress
      torrent.on("download", () => {
        const downloaded = torrent.downloaded;
        const total = torrent.length;
        setProgress((downloaded / total) * 100);
        setDownloadSpeed(torrent.downloadSpeed);
        setPeerCount(torrent.numPeers);
      });
      
      // Also update on wire events for accurate peer count
      torrent.on("wire", () => {
        setPeerCount(torrent.numPeers);
      });
    }

    return () => {
      client.destroy();
      clientRef.current = null;
    };
  }, [torrentUrl, autoPlay, initialTime]);

  const handleTimeUpdate = () => {
    if (videoRef.current && onTimeUpdate) {
      onTimeUpdate(videoRef.current.currentTime);
    }
  };

  const handleEnded = () => {
    if (onEnded) {
      onEnded();
    }
  };

  return (
    <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        className="w-full h-full"
        poster={poster}
        controls
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        playsInline
      >
        Your browser does not support the video tag.
      </video>

      {isLoading && (
        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-white text-lg">Loading torrent...</p>
          {progress > 0 && (
            <div className="mt-2">
              <div className="w-64 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-gray-400 text-sm mt-1">
                {Math.round(progress)}% loaded
              </p>
            </div>
          )}
          {downloadSpeed > 0 && (
            <p className="text-green-400 text-sm mt-2">
              ↓ {formatSpeed(downloadSpeed)}/s
            </p>
          )}
          {peerCount > 0 && (
            <p className="text-yellow-400 text-sm mt-1">
              👥 {peerCount} peers connected
            </p>
          )}
        </div>
      )}

      {error && (
        <div className="absolute inset-0 bg-red-900/90 flex items-center justify-center">
          <p className="text-white text-lg">{error}</p>
        </div>
      )}

      {title && !isLoading && !error && (
        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/70 to-transparent">
          <h3 className="text-white text-lg font-semibold truncate">{title}</h3>
        </div>
      )}
    </div>
  );
};

function formatSpeed(bytesPerSecond: number): string {
  if (bytesPerSecond < 1024) return `${bytesPerSecond} B`;
  if (bytesPerSecond < 1024 * 1024) return `${(bytesPerSecond / 1024).toFixed(1)} KB`;
  return `${(bytesPerSecond / (1024 * 1024)).toFixed(1)} MB`;
}

export default VideoPlayer;