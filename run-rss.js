require('dotenv').config();
const sequelize = require("./config/config");
const updateBlogDatabase = require("./services/rssFetcher");

async function run() {
  try {
    console.log("Checking database connection...");
    await sequelize.sync(); 
    
    console.log("🚀 Starting News Process...");
    // Explicitly await the function imported from rssFetcher.js
    await updateBlogDatabase(); 
    
    console.log("✅ RSS Process Completed Successfully");
    process.exit(0);
  } catch (error) {
    console.error("❌ Process Failed:", error);
    process.exit(1);
  }
}

run();