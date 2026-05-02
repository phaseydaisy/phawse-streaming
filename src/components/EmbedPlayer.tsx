"use client";

import { useRef, useEffect, useState } from "react";

interface EmbedPlayerProps {
  embedUrl: string;
  title?: string;
  onEnded?: () => void;
}

export default function EmbedPlayer({ embedUrl, title, onEnded }: EmbedPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
  }, [embedUrl]);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setError("Failed to load the video player. The source may be unavailable.");
  };

  return (
    <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            <p className="text-white text-sm">Loading player...</p>
          </div>
        </div>
      )}

      {/* Error overlay */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
          <div className="flex flex-col items-center gap-4 p-4 text-center">
            <p className="text-red-400 text-lg">⚠️</p>
            <p className="text-white">{error}</p>
            <p className="text-gray-400 text-sm">Try selecting a different episode or source</p>
          </div>
        </div>
      )}

      {/* Embed iframe */}
      <iframe
        ref={iframeRef}
        src={embedUrl}
        title={title || "Anime Player"}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        allowFullScreen
        className="absolute top-0 left-0 w-full h-full border-0"
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  );
}