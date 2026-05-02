import jikanApi from "@/lib/jikan";
import { anilistApi } from "@/lib/anilist";
import EpisodeList from "./EpisodeList";
import VideoPlayer from "@/components/VideoPlayer";

export default async function AnimePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const animeId = Number(id);

  // Fetch from both Jikan and AniList in parallel
  const [jikanRes, anilistData] = await Promise.all([
    jikanApi.getAnimeDetails(animeId),
    anilistApi.getAnimeByMalId(animeId).catch(() => null),
  ]);

  const data = jikanRes.data;

  // Get episode count from both sources and use the maximum
  const jikanEpisodes = data.episodes || 0;
  const anilistEpisodes = anilistData?.episodes || 0;
  const totalEpisodes = Math.max(jikanEpisodes, anilistEpisodes);

  // Fetch ALL episodes from Jikan (handle pagination)
  let episodes: any[] = [];
  try {
    // First, get the first page to determine total pages
    const firstPage = await jikanApi.getEpisodes(animeId, 1);
    const firstPageData = firstPage.data || [];
    const lastPage = firstPage.pagination?.last_visible_page || 1;
    
    episodes = [...firstPageData];
    
    // Fetch remaining pages if any
    if (lastPage > 1) {
      const remainingPages = await Promise.all(
        Array.from({ length: lastPage - 1 }, (_, i) => 
          jikanApi.getEpisodes(animeId, i + 2)
        )
      );
      for (const page of remainingPages) {
        episodes.push(...(page.data || []));
      }
    }
  } catch (e) {
    console.log("No episodes available");
  }

  return (
    <main className="min-h-screen text-white" style={{ background: "var(--bg-primary)" }}>
      {/* Sidebar Layout */}
      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Left Sidebar - Anime Info */}
        <aside className="w-full lg:w-80 flex-shrink-0 lg:h-screen lg:overflow-y-auto border-r border-zinc-800 p-6">
          {/* Poster */}
          <img
            src={data.images.jpg.large_image_url}
            alt={data.title}
            className="w-full rounded-xl shadow-2xl mb-6"
          />

          {/* Title */}
          <h1 className="text-2xl font-bold mb-4">{data.title}</h1>
          
          {/* Metadata */}
          <div className="flex flex-wrap gap-2 mb-4">
            {data.genres?.map((g: any) => (
              <span key={g.name} className="px-2 py-1 rounded-full text-xs" style={{ background: "var(--accent-primary)", opacity: 0.8 }}>
                {g.name}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {data.year && (
              <span className="px-2 py-1 rounded-full text-xs" style={{ background: "var(--bg-secondary)" }}>
                {data.year}
              </span>
            )}
            <span className="px-2 py-1 rounded-full text-xs" style={{ background: "var(--bg-secondary)" }}>
              {data.type || "TV"}
            </span>
            {(totalEpisodes > episodes.length) ? (
              <span className="px-2 py-1 rounded-full text-xs" style={{ background: "var(--bg-secondary)" }}>
                {episodes.length}/{totalEpisodes} episodes
              </span>
            ) : (
              <span className="px-2 py-1 rounded-full text-xs" style={{ background: "var(--bg-secondary)" }}>
                {episodes.length} episodes
              </span>
            )}
          </div>

          {/* Score */}
          <div className="flex items-center gap-2 mb-6">
            <span className="text-3xl font-bold text-gradient">★</span>
            <span className="text-2xl font-bold">{data.score || "N/A"}</span>
            {data.rank && (
              <span className="text-gray-400 text-sm">Ranked #{data.rank}</span>
            )}
          </div>

          {/* Synopsis - Always fits in sidebar */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Synopsis</h2>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              {data.synopsis || "No synopsis available."}
            </p>
          </div>

          {/* Alternative Titles */}
          {data.title_english && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold mb-1">English</h3>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{data.title_english}</p>
            </div>
          )}
          {data.title_japanese && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold mb-1">Japanese</h3>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{data.title_japanese}</p>
            </div>
          )}
        </aside>

        {/* Right Content - Video & Episodes */}
        <div className="flex-1 p-6">
          <EpisodeList 
            animeId={animeId} 
            animeTitle={data.title} 
            initialEpisodes={episodes}
            totalEpisodes={totalEpisodes}
            trailerUrl={data.trailer?.url}
            posterUrl={data.images.jpg.large_image_url}
          />
        </div>
      </div>
    </main>
  );
}