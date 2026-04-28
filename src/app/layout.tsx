import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "KUMOTV",
  description: "Watch anime without ads",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#0b0c10] text-white`}>
        <Providers>
          {/* NAVBAR */}
          <nav className="flex justify-between items-center py-6 border-b border-zinc-800 mb-8">
            <a href="/" className="text-xl font-bold ml-4 hover:opacity-80 transition-opacity">KUMOTV</a>
            <div className="flex gap-6 text-sm">
              <a href="/" className="nav-link">Home</a>
              <a href="/search" className="nav-link">Search</a>
              <a href="/favorites" className="nav-link">Favorites</a>
              <a href="/profile" className="nav-link">Profile</a>
            </div>
          </nav>

          {/* PAGE CONTENT */}
          <main className="max-w-7xl mx-auto px-4">
            {children}
          </main>

          {/* FOOTER */}
          <footer className="mt-16 py-8 text-center text-sm text-gray-500 border-t border-zinc-800">
            Powered by Jikan API • Built with Next.js
          </footer>
        </Providers>
      </body>
    </html>
  );
}