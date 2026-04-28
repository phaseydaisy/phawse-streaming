import axios from "axios";

const jikan = axios.create({
  baseURL: "https://api.jikan.moe/v4",
});

const wait = (ms = 1000) => new Promise((r) => setTimeout(r, ms));

async function get<T>(url: string) {
  await wait(); // basic rate limit protection
  const res = await jikan.get<T>(url);
  return res.data;
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