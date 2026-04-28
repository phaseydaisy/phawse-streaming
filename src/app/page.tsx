import jikanApi from "@/lib/jikan";
import Link from "next/link";

export default async function Home() {
  const seasonal: any = await jikanApi.getCurrentSeason();
  const top: any = await jikanApi.getTopAnime();

  const current = Array.from(
    new Map(seasonal.data.map((a: any) => [a.mal_id, a])).values()
  );

  const topAnime = top.data.slice(0, 12);

  return (
    <main className="min-h-screen text-white">

      {/* HERO */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-16">
        <h1 className="text-5xl font-bold">
          Watch Anime <span className="text-purple-400">Zero Ads</span>
        </h1>

        <p className="text-gray-400 mt-4 max-w-xl">
          Your friend's streaming site. No ads, no BS — just anime.
        </p>

        <div className="flex gap-4 mt-8">
          <button className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 backdrop-blur">
            Start Watching
          </button>
          <button className="px-6 py-3 rounded-xl border border-white/10 hover:bg-white/5">
            Learn More
          </button>
        </div>

        {/* STATS */}
        <div className="flex gap-4 mt-10 flex-wrap">
          {[
            ["10K+", "Anime Titles"],
            ["Free", "No Ads Ever"],
            ["HD", "Quality Stream"],
          ].map(([a, b]) => (
            <div
              key={a}
              className="bg-white/5 border border-white/10 backdrop-blur rounded-xl px-5 py-4"
            >
              <p className="text-xl font-bold">{a}</p>
              <p className="text-xs text-gray-400">{b}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CURRENTLY AIRING */}
      <section className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex justify-between mb-6">
          <h2 className="text-xl font-semibold">Currently Airing</h2>
          <Link href="/season" className="text-sm text-gray-400">
            View All →
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-5">
          {current.slice(0, 12).map((anime: any) => (
            <Link key={anime.mal_id} href={`/anime/${anime.mal_id}`}>
              <div className="hover:scale-105 transition space-y-2">
                <img
                  src={anime.images.jpg.image_url}
                  className="rounded-xl w-full h-64 object-cover"
                />

                <p className="text-sm line-clamp-2">
                  {anime.title}
                </p>

                <p className="text-xs text-gray-400">
                  ★ {anime.score ?? "N/A"}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* TOP RATED */}
      <section className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex justify-between mb-6">
          <h2 className="text-xl font-semibold">Top Rated</h2>
          <Link href="/top" className="text-sm text-gray-400">
            View All →
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-5">
          {topAnime.map((anime: any) => (
            <Link key={anime.mal_id} href={`/anime/${anime.mal_id}`}>
              <div className="hover:scale-105 transition space-y-2">
                <img
                  src={anime.images.jpg.image_url}
                  className="rounded-xl w-full h-64 object-cover"
                />

                <p className="text-sm">{anime.title}</p>

                <p className="text-xs text-gray-400">
                  ★ {anime.score}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

    </main>
  );
}