// Test script for gogoanime package
const gogoanime = require("gogoanime");

async function test() {
  console.log("Testing gogoanime package...");
  
  try {
    console.log("Searching for 'naruto'...");
    const results = await gogoanime.search("naruto");
    console.log("Search results:", JSON.stringify(results, null, 2));
  } catch (error) {
    console.error("Search error:", error.message);
  }
}

test();