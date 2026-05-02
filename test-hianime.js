// Test script for hianime package
const { Hianime } = require("hianime");

async function test() {
  console.log("Testing hianime package...");
  const hianime = new Hianime();
  
  try {
    console.log("Searching for 'naruto'...");
    const results = await hianime.search("naruto");
    console.log("Search results count:", results.length);
    if (results.length > 0) {
      console.log("First result:", JSON.stringify(results[0], null, 2));
      
      // Try to get episodes
      console.log("\nGetting episodes...");
      const episodes = await hianime.getEpisodes(results[0].id);
      console.log("Episodes count:", episodes.length);
      if (episodes.length > 0) {
        console.log("First episode:", JSON.stringify(episodes[0], null, 2));
        
        // Try to get episode sources
        console.log("\nGetting episode sources...");
        const sources = await hianime.getEpisodeSources(episodes[0].episodeId);
        console.log("Sources:", JSON.stringify(sources, null, 2).substring(0, 3000));
      }
    }
  } catch (error) {
    console.error("Error:", error.message);
    console.error(error.stack);
  }
}

test();