import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");

  if (!q) {
    return NextResponse.json({ error: "Missing query parameter q" }, { status: 400 });
  }

  try {
    // Search Nyaa.si for the torrent
    const searchUrl = `https://nyaa.si/?f=0&c=1_2&q=${encodeURIComponent(q)}`;
    
    const response = await fetch(searchUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    const html = await response.text();

    // Parse the HTML to find torrent links
    const magnetMatch = html.match(/magnet:\?xt=urn:btih:([a-fA-F0-9]+)[^"']*/);
    
    if (magnetMatch) {
      const magnetHash = magnetMatch[1];
      const magnet = `magnet:?xt=urn:btih:${magnetHash}`;
      
      return NextResponse.json({
        magnet,
        searchUrl,
      });
    }

    // Try alternative parsing - look for data attributes
    const dataMagnetMatch = html.match(/data-hash="([a-fA-F0-9]+)"/);
    if (dataMagnetMatch) {
      const magnetHash = dataMagnetMatch[1];
      const magnet = `magnet:?xt=urn:btih:${magnetHash}`;
      
      return NextResponse.json({
        magnet,
        searchUrl,
      });
    }

    return NextResponse.json({
      error: "No torrent found",
      searchUrl,
    });

  } catch (error) {
    console.error("Torrent search error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}