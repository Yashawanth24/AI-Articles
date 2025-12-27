const axios = require("axios");
const cheerio = require("cheerio");

const scrapeWebsite = async (articleUrl) => {
  try {
    const { data: htmlContent } = await axios.get(articleUrl);
    const $ = cheerio.load(htmlContent);

    const title = $("h1").first().text().trim();
    // Get all paragraphs to reconstruct a full article body
    const paragraphs = $("article p, .article-body p, .entry-content p")
      .map((i, el) => $(el).text())
      .get();
    
    const fullContent = paragraphs.join("\n\n"); // Store as formatted blocks
    const image = $("meta[property='og:image']").attr("content");

    return {
      title,
      content: fullContent,
      summary: paragraphs.slice(0, 3).join(" "), // Auto-summary from first 3 lines
      image,
      isValid: fullContent.length > 500, 
    };
  } catch (error) {
    return { isValid: false };
  }
};

module.exports = scrapeWebsite;