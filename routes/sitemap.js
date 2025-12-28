const Article = require("../models/Article");
const { Router } = require("express");
const router = Router();

router.get("/", async (req, res) => {
    const articles = await Article.findAll({ order: [["hypeScore", "DESC"]], limit: 50 }); // Prioritize trending articles
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
              <changefreq>daily</changefreq>
              <priority>0.8</priority>
            </url>
          `
              )
              .join("")}
        </urlset>`
    );
});

module.exports = router;