require('dotenv').config();

const fetchAndValidateRSS = require("./services/rssFetcher");
fetchAndValidateRSS("https://www.techradar.com/rss", "tech-news");