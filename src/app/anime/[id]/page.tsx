import jikanApi from "@/lib/jikan";
import EpisodeList from "./EpisodeList";

export default async function AnimePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const animeId = Number(id);

  const res = await jikanApi.getAnimeDetails(animeId);
  const data = res.data;

  // Fetch episodes (may have pagination)
  let episodes: any[] = [];
  try {
    const epRes = await jikanApi.getEpisodes(animeId);
    episodes = epRes.data || [];
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
            {data.episodes && (
              <span className="px-2 py-1 rounded-full text-xs" style={{ background: "var(--bg-secondary)" }}>
                {data.episodes} episodes
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
          />
        </div>
      </div>
    </main>
  );
}