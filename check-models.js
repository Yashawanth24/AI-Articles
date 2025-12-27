require('dotenv').config();
const { GoogleGenAI } = require("@google/genai");

async function listModels() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  try {
    const models = await ai.models.list();
    console.log("Available models for your key:");
    models.forEach(m => {
      if (m.supportedGenerationMethods.includes("generateContent")) {
        console.log(`- ${m.name}`);
      }
    });
  } catch (err) {
    console.error("Error fetching models:", err.message);
  }
}

listModels();