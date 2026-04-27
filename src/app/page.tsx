import { jikanApi, Anime } from "@/lib/jikan";
import Link from "next/link";
import Image from "next/image";

async function getTopAnime(): Promise<Anime[]> {
  try {
    const data = await jikanApi.getTopAnime(1, 12);
    return data.data;
  } catch (error) {
    console.error("Failed to fetch top anime:", error);
    return [];
  }
}

async function getCurrentSeason(): Promise<Anime[]> {
  try {
    const data = await jikanApi.getCurrentSeason(1, 12);
    return data.data;
  } catch (error) {
    console.error("Failed to fetch current season:", error);
    return [];
  }
}

export default async function Home() {
  const [topAnime, currentSeason] = await Promise.all([
    getTopAnime(),
    getCurrentSeason(),
  ]);

  return (
    <main className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Header */}
      <header className="sticky top-0 z-50" style={{ background: 'rgba(10, 10, 15, 0.8)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--accent-primary), #7c3aed)' }}>
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-gradient">phawse</span>
          </Link>
          <nav className="flex items-center gap-8">
            <Link href="/" className="nav-link">Home</Link>
            <Link href="/search" className="nav-link">Search</Link>
            <Link href="/favorites" className="nav-link">Favorites</Link>
            <Link href="/profile" className="nav-link">Profile</Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0" style={{ 
          background: 'radial-gradient(ellipse 100% 80% at 50% 0%, rgba(139, 92, 246, 0.2), transparent)' 
        }} />
        <div className="container mx-auto px-6 relative">
          <div className="max-w-2xl animate-fade-in">
            <h1 className="text-5xl font-bold mb-6 leading-tight">
              Watch Anime <span className="text-gradient">Zero Ads</span>
            </h1>
            <p className="text-xl mb-8" style={{ color: 'var(--text-secondary)' }}>
              Your friend's streaming site. No ads, no BS — just anime. 
              Powered by the community, for the community.
            </p>
            <div className="flex gap-4">
              <Link href="/search" className="btn-primary">
                Start Watching
              </Link>
              <Link href="/about" className="btn-secondary">
                Learn More
              </Link>
            </div>
          </div>
          
          {/* Floating stats */}
          <div className="flex gap-8 mt-12 animate-fade-in animate-fade-in-delay-2">
            <div className="glass-card px-6 py-4">
              <div className="text-2xl font-bold text-gradient">10K+</div>
              <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Anime Titles</div>
            </div>
            <div className="glass-card px-6 py-4">
              <div className="text-2xl font-bold text-gradient">Free</div>
              <div className="text-sm" style={{ color: 'var(--text-muted)' }}>No Ads Ever</div>
            </div>
            <div className="glass-card px-6 py-4">
              <div className="text-2xl font-bold text-gradient">HD</div>
              <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Quality Stream</div>
            </div>
          </div>
        </div>
      </section>

      {/* Current Season */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">Currently Airing</h2>
            <Link href="/search?season=now" className="text-sm font-medium" style={{ color: 'var(--accent-secondary)' }}>
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-5 stagger-grid">
            {currentSeason.map((anime) => (
              <Link key={anime.mal_id} href={`/anime/${anime.mal_id}`} className="group">
                <div className="anime-card glass-card">
                  <Image
                    src={anime.images.jpg.large_image_url}
                    alt={anime.title_english || anime.title}
                    fill
                    className="object-cover"
                  />
                  {anime.score && (
                    <div className="score-badge absolute top-3 right-3">
                      ★ {anime.score}
                    </div>
                  )}
                </div>
                <h4 className="font-medium text-sm mt-3 line-clamp-2 group-hover:text-purple-400" style={{ color: 'var(--text-primary)' }}>
                  {anime.title_english || anime.title}
                </h4>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  {anime.aired?.from ? new Date(anime.aired.from).getFullYear() : 'N/A'} • {anime.type}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Top Anime */}
      <section className="py-16" style={{ background: 'var(--bg-secondary)' }}>
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">Top Rated</h2>
            <Link href="/search?sort=score" className="text-sm font-medium" style={{ color: 'var(--accent-secondary)' }}>
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-5 stagger-grid">
            {topAnime.map((anime) => (
              <Link key={anime.mal_id} href={`/anime/${anime.mal_id}`} className="group">
                <div className="anime-card glass-card">
                  <Image
                    src={anime.images.jpg.large_image_url}
                    alt={anime.title_english || anime.title}
                    fill
                    className="object-cover"
                  />
                  {anime.score && (
                    <div className="score-badge absolute top-3 right-3">
                      ★ {anime.score}
                    </div>
                  )}
                </div>
                <h4 className="font-medium text-sm mt-3 line-clamp-2 group-hover:text-purple-400" style={{ color: 'var(--text-primary)' }}>
                  {anime.title_english || anime.title}
                </h4>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  {anime.type} • {anime.episodes ? `${anime.episodes} eps` : "Ongoing"}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 mt-12" style={{ borderTop: '1px solid var(--border-subtle)' }}>
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--accent-primary), #7c3aed)' }}>
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="font-bold" style={{ color: 'var(--text-primary)' }}>phawse</span>
          </div>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Powered by Jikan API • Built with Next.js • Hosted on Cloudflare
          </p>
          <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
            Made by fans, for fans. Not affiliated with any streaming service.
          </p>
        </div>
      </footer>
    </main>
  );
}