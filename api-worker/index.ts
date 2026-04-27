export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // everything lives under /apiv1
    if (!path.startsWith("/apiv1")) {
      return new Response("Not Found", { status: 404 });
    }

    // health check
    if (path === "/apiv1") {
      return json({ status: "ok" });
    }

    // search
    if (path === "/apiv1/search") {
      const q = url.searchParams.get("q");

      if (!q) {
        return json({ error: "Missing query parameter q" }, 400);
      }

      return json({
        message: "Search working",
        query: q,
        results: []
      });
    }

    // search-torrent - search Nyaa.si for anime torrents
    if (path === "/apiv1/search-torrent") {
      const q = url.searchParams.get("q");

      if (!q) {
        return json({ error: "Missing query parameter q" }, 400);
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
        // Look for the first result with a magnet link
        const magnetMatch = html.match(/magnet:\?xt=urn:btih:([a-fA-F0-9]+)[^"']*/);
        
        if (magnetMatch) {
          const magnetHash = magnetMatch[1];
          const magnet = `magnet:?xt=urn:btih:${magnetHash}`;
          
          return json({
            magnet,
            searchUrl,
          });
        }

        // Try alternative parsing - look for data attributes
        const dataMagnetMatch = html.match(/data-hash="([a-fA-F0-9]+)"/);
        if (dataMagnetMatch) {
          const magnetHash = dataMagnetMatch[1];
          const magnet = `magnet:?xt=urn:btih:${magnetHash}`;
          
          return json({
            magnet,
            searchUrl,
          });
        }

        return json({
          error: "No torrent found",
          searchUrl,
        });

      } catch (error) {
        console.error("Torrent search error:", error);
        return json({ error: "Search failed" }, 500);
      }
    }

    // anime details
    if (path.startsWith("/apiv1/anime/")) {
      const id = path.split("/").pop();

      return json({
        animeId: id,
        source: "anilist"
      });
    }

    return json({ error: "Not found" }, 404);
  },
};

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}