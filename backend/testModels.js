const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function listModels() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // Try listing models across different versions
    const versions = ['v1', 'v1beta'];
    
    for (const version of versions) {
      console.log(`\n--- Models for API version: ${version} ---`);
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/${version}/models?key=${process.env.GEMINI_API_KEY}`);
        const data = await response.json();
        
        if (data.models) {
          data.models.forEach(model => {
            console.log(`Name: ${model.name}, Methods: ${model.supportedGenerationMethods.join(', ')}`);
          });
        } else {
          console.log(`No models found or error: ${JSON.stringify(data)}`);
        }
      } catch (err) {
        console.error(`Error fetching for ${version}:`, err.message);
      }
    }
  } catch (err) {
    console.error('Diagnostic failed:', err.message);
  }
}

listModels();
