const axios = require("axios");
const cheerio = require("cheerio");

const scrapeWebsite = async (articleUrl) => {
  console.log(`[SCRAPING] Url: ${articleUrl}`);

  try {
    // Step 1: Fetch the HTML content
    const { data: htmlContent } = await axios.get(articleUrl);
    const $ = cheerio.load(htmlContent);

    // Step 2: Extract main content (adjust selectors for other sites)
    const articleTitle = $("h1").first().text().trim(); // Example to target the title
    const articleBody = $(".article-body").text().trim(); // Target main article content
    const articleImage = $("meta[property='og:image']").attr("content"); // Get OG image

    // Clean and trim the data
    const summary = articleBody.slice(0, 1000) + "...";

    return {
      title: articleTitle,
      summary: summary,
      image: articleImage,
      isValid: articleBody.length > 150, // Ensure content is valid
    };
  } catch (error) {
    console.error(`[ERROR] Failed to scrape article: ${articleUrl}`, error.message);
    return { title: null, summary: null, image: null, isValid: false };
  }
};

module.exports = scrapeWebsite;