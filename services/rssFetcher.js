const axios = require("axios");
const { parseStringPromise } = require("xml2js");
const Article = require("../models/Article");
const { validateAndSummarize } = require("./summarizer");

const rssFeeds = [
  { url: "https://www.techradar.com/rss", category: "tech" },
  { url: "https://www.cnet.com/rss/all/", category: "tech" },
  { url: "https://www.theverge.com/rss/index.xml", category: "tech" },
  { url: "https://www.wired.com/feed/rss", category: "tech" },
  { url: "http://feeds.arstechnica.com/arstechnica/technology-lab", category: "tech" },
  { url: "https://www.engadget.com/rss.xml", category: "tech" },
];

const fetchAndValidateRSS = async () => {
  console.log(`[RSS FETCHER] Starting RSS Fetch...`);

  for (const feed of rssFeeds) {
    console.log(`[FETCHING] RSS Feed: ${feed.url}`);
    try {
      // Step 1: Fetch and parse feed
      const { data: rssData } = await axios.get(feed.url);
      const parsed = await parseStringPromise(rssData);

      const items = parsed.rss.channel[0].item;
      for (const item of items) {
        const title = item.title[0];
        const url = item.link[0];
        const publishedAt = new Date(item.pubDate[0]);

        // Check for duplicate articles
        const existingArticle = await Article.findOne({ where: { url } });
        if (existingArticle) {
          console.log(`[SKIP] Article already exists: ${title}`);
          continue;
        }

        // Summarize and save
        const { summary, isValid } = await validateAndSummarize(url, title);
        if (!isValid) continue; // Skip invalid articles

        await Article.create({ title, url, category: feed.category, summary, publishedAt });
        console.log(`[SUCCESS] Saved article: ${title}`);
      }
    } catch (error) {
      console.error(`[ERROR] Failed to process feed ${feed.url}:`, error.message);
    }
  }

  console.log(`[RSS FETCHER] RSS Fetch Complete.`);
};

module.exports = fetchAndValidateRSS;