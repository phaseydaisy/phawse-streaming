import { NextResponse } from "next/server";
import { getStreamUrl } from "@/lib/anime-provider";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const animeId = searchParams.get("animeId");
  const episode = searchParams.get("episode");

  if (!animeId) {
    return NextResponse.json({ error: "Missing animeId parameter" }, { status: 400 });
  }

  const episodeNum = episode ? parseInt(episode) : 1;
  const id = parseInt(animeId);

  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid animeId parameter" }, { status: 400 });
  }

  try {
    console.log(`Searching for stream: Anime ID ${id} - Episode ${episodeNum}`);
    
    // Use the anime provider to get embed streams
    const streams = await getStreamUrl(id, episodeNum);

    if (streams.length === 0) {
      return NextResponse.json({
        streams: [],
        error: "No streams found. The anime may not be available.",
        message: "Try a different anime title"
      });
    }

    return NextResponse.json({
      streams,
      message: "Streams found"
    });

  } catch (error) {
    console.error("Stream search error:", error);
    return NextResponse.json({ 
      error: "Search failed",
      message: "An error occurred while searching for streams"
    }, { status: 500 });
  }
}