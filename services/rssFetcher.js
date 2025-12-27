const Article = require("../models/Article");
const { fetchAndSynthesizeNews } = require("./newsService");

const updateBlogDatabase = async () => {
  console.log("🚀 Starting Legal News Synthesis...");
  
  // We target specific niches to look professional for AdSense
  const techNews = await fetchAndSynthesizeNews("AI gadgets software");

  for (const blog of techNews) {
    const existing = await Article.findOne({ where: { url: blog.url } });
    if (!existing) {
      await Article.create({
        title: blog.displayTitle, // Use the AI's unique title
        url: blog.url,
        summary: blog.content.substring(0, 200) + "...",
        content: blog.content, // Full AI-written blog
        image: blog.image,
        category: "Tech",
        publishedAt: blog.publishedAt
      });
      console.log(`✅ Published Original Blog: ${blog.displayTitle}`);
    }
  }
};

module.exports = updateBlogDatabase;