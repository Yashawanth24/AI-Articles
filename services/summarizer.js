const axios = require("axios");
const cheerio = require("cheerio");
const { decode } = require("html-entities");
const scrapeWebsite = require("./scraper");

async function fetchArticleText(url) {
  try {
    const { data } = await axios.get(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; tech-platform/1.0)" },
      timeout: 10000,
    });

    const $ = cheerio.load(data);
    $("script, style, noscript, header, footer, svg, nav").remove();

    let articleText = "";
    const article = $("article");
    if (article.length) {
      articleText = article.find("p").map((i, el) => $(el).text()).get().join(" ");
    } else if ($("main").length) {
      articleText = $("main").find("p").map((i, el) => $(el).text()).get().join(" ");
    } else {
      articleText = $("p").map((i, el) => $(el).text()).get().join(" ");
    }

    articleText = decode(articleText).replace(/\s+/g, " ").trim();
    return articleText;
  } catch (err) {
    throw new Error("Failed to fetch article HTML: " + err.message);
  }
}

function simpleSummarize(text, maxSentences = 3) {
  if (!text) return "";
  const sentences = text.match(/[^\.!?]+[\.!?]+/g) || [text];
  return sentences.slice(0, maxSentences).join(" ").trim();
}

const validateAndSummarize = async (articleUrl, articleTitle) => {
  console.log(`[VALIDATE] Processing: ${articleTitle} (${articleUrl})`);

  const scrapedData = await scrapeWebsite(articleUrl);
  
  if (scrapedData.isValid) {
    return {
      summary: scrapedData.summary,
      image: scrapedData.image, // Return the image found by scraper
      isValid: true
    };
  }

  // Try external summarizer if configured
  if (process.env.GEMINI_API_URL && process.env.GEMINI_API_KEY) {
    try {
      const { data: geminiResponse } = await axios.post(
        process.env.GEMINI_API_URL,
        { url: articleUrl },
        {
          headers: { Authorization: `Bearer ${process.env.GEMINI_API_KEY}` },
          timeout: 10000,
        }
      );

      const summary = geminiResponse.summary || geminiResponse.summary_text || geminiResponse.summaryText;
      const validityScore = geminiResponse.validity_score ?? geminiResponse.validityScore ?? 1;
      const isValid = (validityScore || 0) > 0.8;

      if (summary) return { summary, isValid };
    } catch (err) {
      console.warn("[WARN] External summarizer failed, falling back to local summarizer:", err.message);
    }
  }

  // Local fallback summarization: fetch article HTML and extract text
  try {
    const text = await fetchArticleText(articleUrl);
    if (!text || text.length < 100) return { summary: "", isValid: false };

    // If SAVE_FULL_ARTICLE is set, store the full cleaned article text.
    if (process.env.SAVE_FULL_ARTICLE === "true") {
      return { summary: text, isValid: true };
    }

    const summary = simpleSummarize(text, 3);
    const isValid = summary.length > 50;
    return { summary, isValid };
  } catch (err) {
    console.error("[ERROR] Local summarizer failed:", err.message);
    return { summary: "", isValid: false };
  }
};

module.exports = { validateAndSummarize };