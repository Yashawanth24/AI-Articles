const Article = require("../models/Article");
const { Router } = require("express");
const router = Router();

// Validate and display pending articles
router.get("/validate", async (req, res) => {
  const pendingArticles = await Article.findAll({ where: { summary: null } });
  res.render("validation", { pendingArticles, title: "Validate Articles" });
});

// Manually mark an article as "accepted"
router.post("/validate/:id/approve", async (req, res) => {
  const { id } = req.params;
  const article = await Article.findByPk(id);
  if (!article) return res.status(404).send("Article not found");

  article.isValid = true; // Mark as approved
  await article.save();
  res.redirect("/validate");
});

// Reject or delete invalid articles
router.post("/validate/:id/reject", async (req, res) => {
  const { id } = req.params;
  const article = await Article.findByPk(id);
  if (!article) return res.status(404).send("Article not found");

  await article.destroy(); // Delete invalid entry
  res.redirect("/validate");
});

module.exports = router;