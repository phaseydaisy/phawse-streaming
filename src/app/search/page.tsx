"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

interface Anime {
  mal_id: number;
  title: string;
  images: {
    jpg: {
      image_url: string;
      large_image_url: string;
    };
  };
  score: number | null;
  synopsis: string | null;
}

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query) {
      setLoading(true);
      fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=20`)
        .then((res) => res.json())
        .then((data) => {
          setResults(data.data || []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [query]);

  return (
    <div className="p-6 bg-black min-h-screen text-white">
      <h1 className="text-2xl font-bold mb-6">Search Anime</h1>
      
      <form className="mb-8">
        <input
          type="text"
          name="q"
          defaultValue={query}
          placeholder="Search anime..."
          className="w-full px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white"
        />
      </form>

      {loading ? (
        <p>Loading...</p>
      ) : results.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {results.map((anime) => (
            <Link
              key={anime.mal_id}
              href={`/anime/${anime.mal_id}`}
              className="block bg-zinc-900 rounded-lg overflow-hidden hover:scale-105 transition cursor-pointer"
            >
              <img
                src={anime.images.jpg.image_url}
                alt={anime.title}
                className="w-full h-60 object-cover"
              />
              <div className="p-3">
                <h2 className="font-semibold text-sm">{anime.title}</h2>
                <p className="text-xs text-gray-400">
                  Score: {anime.score ?? "N/A"}
                </p>
              </div>
            </Link>
          ))}
        </div>
      ) : query ? (
        <p>No results found.</p>
      ) : (
        <p>Enter a search term above.</p>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-6 bg-black min-h-screen text-white">Loading...</div>}>
      <SearchContent />
    </Suspense>
  );
}