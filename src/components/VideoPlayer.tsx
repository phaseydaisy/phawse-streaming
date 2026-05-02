"use client";

import { useRef, useEffect, useState } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";

interface VideoPlayerProps {
  streamUrl: string;
  poster?: string;
  title?: string;
  onEnded?: () => void;
  onTimeUpdate?: (currentTime: number) => void;
  initialTime?: number;
  autoPlay?: boolean;
}

const VideoPlayer = ({
  streamUrl,
  poster,
  title,
  onEnded,
  onTimeUpdate,
  initialTime = 0,
  autoPlay = false,
}: VideoPlayerProps) => {
  const videoRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const playerRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Make sure Video.js player is only initialized once
    if (!playerRef.current) {
      const videoElement = document.createElement("video-js");
      videoElement.classList.add("vjs-big-play-centered", "vjs-fluid");
      videoRef.current?.appendChild(videoElement);

      const player = (playerRef.current = videojs(videoElement, {
        controls: true,
        autoplay: autoPlay,
        preload: "auto",
        fluid: true,
        poster: poster,
        sources: [
          {
            src: streamUrl,
            type: "application/x-mpegURL",
          },
        ],
        html5: {
          vhs: {
            overrideNative: true,
          },
        },
      }));

      player.on("ready", () => {
        setIsLoading(false);
        if (initialTime > 0) {
          player.currentTime(initialTime);
        }
      });

      player.on("error", () => {
        const err = player.error();
        setError(err?.message || "Failed to load video");
        setIsLoading(false);
      });

      player.on("ended", () => {
        if (onEnded) {
          onEnded();
        }
      });

      player.on("timeupdate", () => {
        if (onTimeUpdate) {
          const currentTime = player.currentTime();
          if (typeof currentTime === "number") {
            onTimeUpdate(currentTime);
          }
        }
      });
    } else {
      // Update player with new stream URL
      const player = playerRef.current;
      player.poster(poster || "");
      player.src({ src: streamUrl, type: "application/x-mpegURL" });
      
      if (autoPlay) {
        player.play();
      }
    }
  }, [streamUrl, poster, autoPlay, initialTime, onEnded, onTimeUpdate]);

  // Dispose the player on unmount
  useEffect(() => {
    const player = playerRef.current;

    return () => {
      if (player && !player.isDisposed()) {
        player.dispose();
        playerRef.current = null;
      }
    };
  }, []);

  return (
    <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
      <div data-vjs-player>
        <div ref={videoRef} className="w-full h-full" />
      </div>

      {isLoading && (
        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-10">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-white text-lg">Loading stream...</p>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 bg-red-900/90 flex flex-col items-center justify-center z-10">
          <p className="text-white text-lg mb-2">{error}</p>
          <button
            onClick={() => {
              setError(null);
              setIsLoading(true);
              playerRef.current?.play();
            }}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white text-sm"
          >
            Retry
          </button>
        </div>
      )}

      {title && !isLoading && !error && (
        <div className="absolute bottom-16 left-4 right-4">
          <h3 className="text-white text-lg font-semibold truncate">{title}</h3>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;