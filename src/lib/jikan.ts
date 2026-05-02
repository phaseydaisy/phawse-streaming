import axios from "axios";

const jikan = axios.create({
  baseURL: "https://api.jikan.moe/v4",
});

// Rate limiting: Jikan allows 3 requests per second, so we need to wait at least 333ms between requests
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 500; // 500ms between requests to be safe

const wait = async () => {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    await new Promise((r) => setTimeout(r, MIN_REQUEST_INTERVAL - timeSinceLastRequest));
  }
  lastRequestTime = Date.now();
};

async function get<T>(url: string, retries = 3) {
  await wait();
  
  try {
    const res = await jikan.get<T>(url);
    return res.data;
  } catch (error: any) {
    // Handle rate limiting (429) with retry
    if (error.response?.status === 429 && retries > 0) {
      console.log(`Rate limited, retrying in 2s... (${retries} retries left)`);
      await new Promise((r) => setTimeout(r, 2000));
      return get<T>(url, retries - 1);
    }
    throw error;
  }
}

const jikanApi = {
  // 🔥 CURRENT SEASON
  getCurrentSeason: (page = 1) =>
    get<any>(`/seasons/now?page=${page}`),

  // 🔥 TOP ANIME
  getTopAnime: (page = 1) =>
    get<any>(`/top/anime?page=${page}`),

  // 🔥 DETAILS
  getAnimeDetails: (id: number) =>
    get<any>(`/anime/${id}`),

  // 🔥 EPISODES
  getEpisodes: (id: number, page = 1) =>
    get<any>(`/anime/${id}/episodes?page=${page}`),
};

export default jikanApi;