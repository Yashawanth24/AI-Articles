const Article = require("../models/Article");
const { fetchAndSynthesizeNews } = require("./newsService");

const updateBlogDatabase = async () => {
    console.log("🚀 Starting News Synthesis...");

    const queries = ["AI gadgets", "Software news", "AI trends"];
    for (const query of queries) {
        const techNews = await fetchAndSynthesizeNews(query);

        for (const blog of techNews) {
            const existing = await Article.findOne({ where: { url: blog.url } });
            if (!existing) {
                const category = classifyCategory(blog.title); // Use the helper function
                
                await Article.create({
                    title: blog.displayTitle,
                    url: blog.url,
                    summary: blog.content.substring(0, 200) + "...",
                    content: blog.content,
                    image: blog.image,
                    category: category,
                    publishedAt: blog.publishedAt,
                });
                console.log(`✅ Published Original Blog: ${blog.displayTitle}`);
            }
        }
    }
};

// Classify category dynamically
const classifyCategory = (title) => {
    if (title.toLowerCase().includes("software")) return "Software";
    if (title.toLowerCase().includes("gadgets")) return "Gadgets";
    if (title.toLowerCase().includes("AI")) return "Artificial Intelligence";
    return "Tech News"; // Default category
};

module.exports = updateBlogDatabase;