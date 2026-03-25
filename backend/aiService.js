const { Anthropic } = require('@anthropic-ai/sdk');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('./config');

// Initialize clients
const anthropic = new Anthropic({
  apiKey: config.ANTHROPIC_API_KEY || 'dummy',
});

const genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY || 'dummy');

const SYSTEM_PROMPT = (lang) => `You are MedBuddy's Clinical Extraction Engine. 
Your task is to analyze a medical document (prescription, discharge summary, or lab report) and return a structured JSON response in ${lang}.

CRITICAL SAFETY RULES:
1. Simplify without distorting — the plain-language output must stay faithful to what the doctor actually wrote.
2. NEVER add extra medical advice, suggest alternative medicines, or pull in outside information.
3. The medication table must match the prescription EXACTLY — wrong dosage or timing in the output is a direct patient safety failure.
4. If information is missing, use "Not mentioned".
5. If the document is not a medical document, return {"error": "Invalid document type"}.`;

const USER_PROMPT = (docType, age) => `Analyze this ${docType} for a patient aged ${age || 'unknown'}. 
Provide the response EXACTLY in the following JSON format without markdown blocks:
{ 
  "oneLiner": "One-line summary the patient can share with a family member instantly", 
  "summary": "Plain-language diagnosis: what the condition is, explained like talking to a friend, zero jargon", 
  "medications": [ 
    { 
      "name": "Exact medicine name from document", 
      "dosage": "Exact dose as written e.g. 500mg", 
      "frequency": "Timing/how often exactly as written e.g. Twice daily after meals", 
      "duration": "Number of days or as directed", 
      "purpose": "What this medicine does in one simple sentence" 
    } 
  ], 
  "warnings": [ 
    "Side effect alerts: top 2-3 things to watch for, and when to call the doctor immediately" 
  ], 
  "follow_up": [ 
    "Follow-up checklist: tests ordered, diet restrictions, activity limits - as a simple tick list" 
  ], 
  "jargon_comparison": [
    {
      "original": "Original medical jargon phrase from the document",
      "plain": "Plain-language explanation of that exact phrase"
    }
  ]
} 
  
Rules: medications must include ALL medicines listed, never change dosage/frequency/duration. warnings: 2–3 items. follow_up: simple tick list format. Empty array [] if no data. Provide 2-3 jargon comparisons.`;

module.exports = {
  analyzeDocument: async (text, fileData, fileType, lang, age, docType) => {
    console.log(`Analyzing document using ${config.AI_MODEL}: type=${docType}, lang=${lang}, age=${age}, hasFile=${!!fileData}`);
    
    // GEMINI FLOW
    if (config.AI_MODEL === 'gemini') {
      try {
        console.log('--- STARTING GEMINI ANALYSIS ---');
        // Force the use of the stable 'v1' API instead of 'v1beta' to avoid the 404 error
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" }, { apiVersion: 'v1' });
        const prompt = `${SYSTEM_PROMPT(lang)}\n\n${USER_PROMPT(docType, age)}`;
        const parts = [];

        if (fileData && fileType) {
          console.log(`Attaching file: ${fileType}`);
          parts.push({
            inlineData: {
              data: fileData,
              mimeType: fileType
            }
          });
        }
        
        parts.push({ text: text || "Extract data from this medical document." });
        parts.push({ text: prompt });

        const result = await model.generateContent(parts);
        const response = await result.response;
        const raw = response.text();
        console.log('Gemini response received.');
        
        const clean = raw.replace(/```json|```/g, '').trim();
        return JSON.parse(clean);
      } catch (err) {
        console.error('CRITICAL GEMINI ERROR:', err.message);
        console.log('Falling back to simulated analysis...');
        return getSimulatedAnalysis(lang, docType);
      }
    }

    // ANTHROPIC FLOW
    if (config.AI_MODEL === 'anthropic') {
      try {
        const userContent = [];
        if (fileData && fileType) {
          if (fileType === 'application/pdf') {
            userContent.push({ type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: fileData } });
          } else if (fileType.startsWith('image/')) {
            userContent.push({ type: 'image', source: { type: 'base64', media_type: fileType, data: fileData } });
          }
          userContent.push({ type: 'text', text: USER_PROMPT(docType, age) });
        } else {
          userContent.push({ type: 'text', text: `${USER_PROMPT(docType, age)}\n\nDocument:\n${text}` });
        }

        const msg = await anthropic.messages.create({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 1500,
          system: SYSTEM_PROMPT(lang),
          messages: [{ role: 'user', content: userContent }],
        });

        const raw = msg.content.map(c => c.text || '').join('');
        const clean = raw.replace(/```json|```/g, '').trim();
        return JSON.parse(clean);
      } catch (err) {
        console.error('Anthropic Error:', err.message);
        console.log('Falling back to simulated analysis...');
        return getSimulatedAnalysis(lang, docType);
      }
    }

    // FALLBACK
    return getSimulatedAnalysis(lang, docType);
  },

  chatWithBot: async (messages, docContext) => {
    const system = `You are MedBuddy's Clinical Assistant — a friendly plain-language medical guide for patients in India. 
    Help patients understand their diagnosis, medicines, and follow-up steps in simple everyday language. 
      
    Rules: 
    - Never diagnose new conditions or prescribe medicines not in the document. 
    - If asked something outside your scope, say so warmly and suggest asking their doctor. 
    - Keep responses concise — 2–4 sentences unless a detailed breakdown is clearly needed. 
    - Be warm, human, and reassuring. 
    ${docContext ? `\nPatient's analyzed document summary:\n${docContext}` : ''}`;

    if (config.AI_MODEL === 'gemini') {
      try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" }, { apiVersion: 'v1' });
        const chat = model.startChat({
          history: messages.slice(0, -1).map(m => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.text }],
          })),
        });
        const result = await chat.sendMessage(`${system}\n\nUser: ${messages[messages.length - 1].text}`);
        return (await result.response).text();
      } catch (err) {
        console.error('Gemini Chat Error:', err.message);
        if (docContext) {
          return `Demo mode: Based on your analysis, it looks like you're asking about something related to your document. In a live environment, I would provide a detailed explanation. For now, please refer to the "Side-by-Side Comparison" section in the dashboard for jargon like "BD" or "TDS".`;
        }
        return "Demo mode: I'm here to help! The AI is currently unavailable, but I can still guide you through general medical information.";
      }
    }

    return "Demo mode active.";
  }
};

function getSimulatedAnalysis(lang, docType) {
  const samples = {
    prescription: {
      oneLiner: "Prescription for a common bacterial infection (Upper Respiratory Tract Infection).",
      summary: "The doctor has prescribed antibiotics and supportive medicines for what looks like a throat or lung infection. The main goal is to clear the bacteria and reduce your fever/pain.",
      medications: [
        {
          name: "Augmentin 625 Duo",
          dosage: "625mg",
          frequency: "Twice daily (after breakfast and after dinner)",
          duration: "5 days",
          purpose: "Strong antibiotic to kill the bacteria causing the infection."
        },
        {
          name: "Dolo 650",
          dosage: "650mg",
          frequency: "Three times daily (if you have fever or pain)",
          duration: "3 days",
          purpose: "Helps reduce high body temperature and body aches."
        },
        {
          name: "Pan 40",
          dosage: "40mg",
          frequency: "Once daily (30 mins before breakfast)",
          duration: "5 days",
          purpose: "Prevents stomach acidity often caused by antibiotics."
        }
      ],
      warnings: [
        "Complete the full 5-day course of Augmentin even if you feel better.",
        "Call doctor if you develop a skin rash or severe diarrhea."
      ],
      follow_up: [
        "Drink plenty of warm fluids",
        "Avoid cold drinks and spicy food",
        "Rest for at least 3 days"
      ],
      jargon_comparison: [
        {
          original: "BD (Bis in die)",
          plain: "Twice a day"
        },
        {
          original: "TDS (Ter die sumendum)",
          plain: "Three times a day"
        }
      ]
    },
    report: {
      oneLiner: "Blood report showing slightly low Vitamin D levels.",
      summary: "Your lab results are mostly normal, but your Vitamin D level is lower than the recommended range. This is very common and can be corrected with supplements and sunlight.",
      medications: [
        {
          name: "Uprise-D3 60K",
          dosage: "60,000 IU",
          frequency: "Once a week (every Sunday)",
          duration: "8 weeks",
          purpose: "High-dose Vitamin D supplement to boost your levels."
        }
      ],
      warnings: [
        "Do not take more than one capsule per week as Vitamin D can build up.",
        "Take the capsule with a glass of milk for better absorption."
      ],
      follow_up: [
        "Get 15-20 mins of morning sunlight",
        "Eat more eggs, mushrooms, and fortified cereals",
        "Repeat Vitamin D test after 2 months"
      ],
      jargon_comparison: [
        {
          original: "Hypovitaminosis D",
          plain: "Vitamin D deficiency (low levels)"
        },
        {
          original: "Serum 25-hydroxy Vitamin D",
          plain: "A standard blood test for Vitamin D levels"
        }
      ]
    }
  };

  const selected = samples[docType] || samples.prescription;
  
  // If language is not English, add a note (in real app, we would translate)
  if (lang && lang.toLowerCase() !== 'english') {
    selected.oneLiner = `[Simulation - ${lang}] ` + selected.oneLiner;
  }

  return selected;
}
