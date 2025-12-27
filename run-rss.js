require('dotenv').config();
const sequelize = require("./config/config"); // Ensure DB is connected
const updateBlogDatabase = require("./services/rssFetcher");

async function run() {
  try {
    console.log("Checking database connection...");
    // This creates the Articles table if you deleted the .sqlite file
    await sequelize.sync(); 
    
    console.log("🚀 Starting News Process...");
    // Use await so the script doesn't close early
    await updateBlogDatabase(); 
    
    console.log("✅ RSS Process Completed Successfully");
    process.exit(0);
  } catch (error) {
    console.error("❌ Process Failed:", error);
    process.exit(1);
  }
}

run();