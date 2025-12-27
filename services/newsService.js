const axios = require("axios");
const { GoogleGenAI } = require("@google/genai");

// Initialize the Unified Client
const ai = new GoogleGenAI({ 
    apiKey: process.env.GEMINI_API_KEY 
});

// Helper to wait (Essential for Free Tier Quota)
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const fetchAndSynthesizeNews = async (query = "AI software gadgets") => {
  try {
    const newsResponse = await axios.get(`https://newsapi.org/v2/everything`, {
      params: {
        q: query,
        domains: "techcrunch.com,theverge.com,wired.com",
        language: "en",
        sortBy: "publishedAt",
        pageSize: 3, // Keep this small (3) while testing to save daily quota
        apiKey: process.env.NEWS_API_KEY
      }
    });

    const articles = newsResponse.data.articles;
    const synthesizedBlogs = [];

    for (const item of articles) {
      console.log(`[AI] Processing: ${item.title}`);
      
      // MANDATORY: Wait 30 seconds between calls to avoid 429 Quota errors
      await delay(30000); 

      try {
        // [FIX] Use the exact model string required by the v1beta Unified SDK
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash", 
          contents: [{
            role: "user",
            parts: [{
              text: `You are a professional tech blogger. Write a 300-word original article based on this news:
                     Headline: ${item.title}
                     Source: ${item.source.name}
                     Description: ${item.description}
                     
                     Your article should have:
                     1. A new unique title.
                     2. An "Expert Analysis" section.
                     3. A "Final Verdict" on whether this technology matters.
                     
                     Rules: Do not copy the source text. Credit the source at the end: "Original reporting by ${item.source.name}."`
            }]
          }]
        });

        const blogText = response.text;

        synthesizedBlogs.push({
          title: item.title,
          displayTitle: blogText.split('\n')[0].replace(/#/g, '').trim(), 
          content: blogText,
          url: item.url,
          image: item.urlToImage,
          publishedAt: item.publishedAt,
          source: item.source.name
        });

        console.log(`[SUCCESS] AI generated content for: ${item.title}`);

      } catch (aiError) {
        // Handle Quota and Model errors gracefully
        if (aiError.message.includes("429")) {
          console.error("⚠️ Quota hit! Waiting 60s before next skip...");
          await delay(60000);
        } else {
          console.error(`[AI ERROR]: ${aiError.message}`);
        }
      }
    }

    return synthesizedBlogs;
  } catch (error) {
    console.error("General News Service Error:", error.message);
    return [];
  }
};

module.exports = { fetchAndSynthesizeNews };