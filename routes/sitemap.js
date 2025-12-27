const Article = require("../models/Article");
const { Router } = require("express");
const router = Router();

router.get("/", async (req, res) => {
  const articles = await Article.findAll();
  res.type("text/xml");
  res.send(
    `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${articles
        .map(
          (article) => `
        <url>
          <loc>${process.env.BASE_URL}/article/${article.id}</loc>
          <lastmod>${article.publishedAt.toISOString()}</lastmod>
        </url>
      `
        )
        .join("")}
    </urlset>`
  );
});

module.exports = router;