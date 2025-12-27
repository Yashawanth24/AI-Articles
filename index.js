require("dotenv").config();
const express = require("express");
const path = require("path");
const Article = require("./models/Article");
const fetchAndValidateRSS = require("./services/rssFetcher");
const sitemapRoutes = require("./routes/sitemap");
const sequelize = require("./config/config");
const app = express();

// Middleware
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Routes
app.get("/", async (req, res) => {
  const articles = await Article.findAll({ limit: 10, order: [["publishedAt", "DESC"]] });
  res.render("index", {
    title: "Tech News Now - Verified Gadget Blogs",
    description: "Stay updated with verified and accurate tech news, gadget launches, and reviews.",
    articles,
  });
});

app.get("/article/:id", async (req, res) => {
  const article = await Article.findByPk(req.params.id);
  if (!article) return res.status(404).send("Article not found");
  res.render("article", { article, title: article.title, description: article.summary.slice(0, 150) });
});

// Sitemap for SEO
app.use("/sitemap.xml", sitemapRoutes);

// Schedule RSS Fetch and Validation
const cron = require("node-cron");
cron.schedule("0 */6 * * *", async () => {
  console.log("[CronJob] Fetching and Validating RSS Feeds...");
  await fetchAndValidateRSS("https://www.techradar.com/rss", "tech-news");
});



// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);

  await sequelize.sync({ alter: true }); // Automatically updates schema to match the model
  console.log("✅ Database synchronized");
});