const initOpenAI = require('../config/openai');
const initGemini = require('../config/gemini');
const fs = require('fs');
const pdf = require('pdf-parse');
const logger = require('../utils/logger');

const openai = initOpenAI();
const gemini = initGemini();

const extractText = async (filePath, mimeType) => {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    if (mimeType === "application/pdf") {
      const data = await pdf(dataBuffer);
      return data.text;
    }
    return ""; 
  } catch (err) {
    logger.error(`Text extraction failed for ${filePath}: ${err.message}`);
    throw new Error('Failed to extract text from file.');
  }
};

const aiService = async (text, options = {}, filePath = null, mimeType = null) => {
  const { age, language = 'English' } = options;
  const provider = gemini ? 'Gemini' : 'OpenAI';
  logger.info(`Starting ${provider} analysis for ${filePath ? 'file: ' + mimeType : 'text input'} (Language: ${language}, Age: ${age || 'N/A'})`);

  const MASTER_PROMPT = `
    You are MedBuddy — a safe, reliable AI medical document assistant. 
    Your job is to simplify medical documents (prescriptions, discharge summaries, reports) into plain, easy-to-understand language for patients. 
    
    STRICT RULES (MUST FOLLOW): 
    1. DO NOT add new medical advice. 
    2. DO NOT suggest alternative medicines or treatments. 
    3. DO NOT use outside knowledge beyond the uploaded document. 
    4. DO NOT guess missing information. 
    5. Output must remain 100% faithful to the original document. 
    6. If something is unclear, say: "Not clearly mentioned in the document." 
    7. Patient safety is critical — never change dosage, timing, or instructions. 
    8. PERSONALIZATION: If patient age is provided (${age || 'not provided'}), tailor the explanation's complexity and tone accordingly.
    9. LANGUAGE: Respond in ${language}.

    OUTPUT FORMAT (STRICT JSON): 
    { 
      "diagnosis_explanation": "Explain the condition in very simple language, like talking to a friend.", 
      "medication_schedule": [ 
        { 
          "medicine_name": "Exact medicine name", 
          "dosage": "Exact dosage", 
          "timing": "Exact timing", 
          "duration": "Exact duration" 
        } 
      ], 
      "side_effect_alerts": [ 
        "Top 2–3 important side effects mentioned or commonly associated ONLY if present or implied in document" 
      ], 
      "follow_up_checklist": [ 
        "Tests to do", 
        "Diet restrictions", 
        "Activity limits", 
        "Next doctor visit" 
      ], 
      "jargon_map": [
        { "original": "The complex medical term", "simplified": "The plain-language explanation" }
      ],
      "one_line_summary": "A very short summary the patient can share with family." 
    } 

    GUIDELINES: 
    - Convert complex medical terms into simple language. 
    - Keep explanation short and friendly. 
    - If medical terms appear (e.g., hypertension), explain them simply. 
    - Extract medication details EXACTLY as written. 
    - Format schedule cleanly and clearly. 
    - Keep tone calm and reassuring. 
    - Do not include disclaimers like 'consult a doctor' unless explicitly mentioned. 

    EDGE CASE HANDLING: 
    - If no medicines → return empty array [] 
    - If no diagnosis → say "Diagnosis not clearly mentioned" 
    - If multiple medicines → list all properly 
    - If handwriting/OCR is unclear → mark fields as "Unclear" 
  `;

  try {
    let textResponse;

    if (gemini) {
      let result;
      if (filePath && mimeType && mimeType.startsWith("image/")) {
        const imageBuffer = fs.readFileSync(filePath);
        const image = {
          inlineData: {
            data: imageBuffer.toString("base64"),
            mimeType
          }
        };
        result = await gemini.generateContent([MASTER_PROMPT, image]);
      } else {
        result = await gemini.generateContent(MASTER_PROMPT + "\n\nText:\n" + text);
      }
      const response = await result.response;
      textResponse = response.text();
    } else {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: MASTER_PROMPT },
          { role: "user", content: text }
        ],
        temperature: 0.2,
        response_format: { type: "json_object" }
      });
      textResponse = response.choices[0].message.content;
    }

    logger.debug(`AI raw response: ${textResponse}`);
    const jsonStr = textResponse.trim().replace(/```json/g, "").replace(/```/g, "");
    const parsedResult = JSON.parse(jsonStr);
    logger.info(`AI analysis successful for ${filePath ? 'file: ' + mimeType : 'text input'}`);
    return parsedResult;

  } catch (err) {
    logger.error(`🔥 AI ERROR (${provider}): ${err.message}`);
    throw new Error(`AI analysis failed: ${err.message}`);
  }
};

module.exports = { extractText, aiService };
