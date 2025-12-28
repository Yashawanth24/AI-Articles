const axios = require("axios");
const { GoogleGenAI } = require("@google/genai");

// Initialize the Unified Client
const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

// Helper to wait
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper to refresh and retry on quota exhaustion
let quotaExceeded = false; // Flag to track quota exhaustion

const fetchAndSynthesizeNews = async (query = "AI gadgets software") => {
    try {
        const newsResponse = await axios.get(`https://newsapi.org/v2/everything`, {
            params: {
                q: query,
                language: "en",
                sortBy: "popularity",
                pageSize: 5,
                apiKey: process.env.NEWS_API_KEY,
            },
        });

        console.log(`[INFO] News Fetched: ${newsResponse.data.articles.length} articles`);
        const articles = newsResponse.data.articles;
        const synthesizedBlogs = [];

        for (const item of articles) {
            // Controlled API calls for each article
            if (quotaExceeded) {
                console.warn(`⚠️ Skipping AI generation due to quota exhaustion.`);
                break; // Exit loop if quota is exhausted
            }

            console.log(`[AI] Processing: ${item.title}`);
            try {
                const response = await ai.models.generateContent({
                    model: "gemini-2.5-flash",
                    contents: [
                        {
                            role: "user",
                            parts: [
                                {
                                    text: `Write an AI blog post for:
                                        - Title: ${item.title}
                                        - Source: ${item.source.name}
                                        - Description: ${item.description}`,
                                },
                            ],
                        },
                    ],
                });

                const blogText = response.text;

                synthesizedBlogs.push({
                    title: item.title,
                    displayTitle: blogText.split("\n")[0]?.replace(/#/g, "").trim(),
                    content: blogText,
                    url: item.url,
                    image: item.urlToImage,
                    hypeScore: blogText.match(/Final Score: (\d+)/)?.[1] || 5,
                    category: "AI Gadgets",
                });

                // Delay between requests to reduce risk of hitting limits
                await delay(20000); // Wait 20 seconds for free tier limits
            } catch (aiError) {
                if (
                    aiError.message.includes("quota") ||
                    aiError.message.includes("429")
                ) {
                    console.error(
                        `⚠️ Quota Exhaustion Detected. Skipping Further AI Calls`
                    );
                    quotaExceeded = true; // Set flag to skip future requests
                } else {
                    console.error(`[AI ERROR]: ${aiError.message}`);
                }
            }
        }

        return synthesizedBlogs;
    } catch (error) {
        console.error(`[GENERAL ERROR]: ${error.message}`);
        return [];
    }
};

module.exports = { fetchAndSynthesizeNews };