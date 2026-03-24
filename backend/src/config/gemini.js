const { GoogleGenerativeAI } = require("@google/generative-ai");

const initGemini = () => {
  if (!process.env.GENAI_API_KEY) return null;
  const genAI = new GoogleGenerativeAI(process.env.GENAI_API_KEY);
  return genAI.getGenerativeModel({ 
    model: "gemini-2.0-flash-lite", 
  });
};

module.exports = initGemini;
