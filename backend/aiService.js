const { Anthropic } = require('@anthropic-ai/sdk');
const config = require('./config');

const anthropic = new Anthropic({
  apiKey: config.ANTHROPIC_API_KEY,
});

module.exports = {
  analyzeDocument: async (text, fileData, fileType, lang, age, docType) => {
    const systemPrompt = `You are MedBuddy's Clinical Extraction Engine. 
    Your task is to analyze a medical document (prescription, discharge summary, or lab report) and return a structured JSON response in ${lang}.
    
    CRITICAL SAFETY RULES:
    1. Only simplify what is in the document.
    2. NEVER add outside medical advice or suggest new medicines.
    3. NEVER change dosages, frequencies, or durations.
    4. If information is missing, use "Not mentioned".
    5. If the document is not a medical document, return {"error": "Invalid document type"}.`;

    const userPrompt = `Analyze this ${docType} for a patient aged ${age || 'unknown'}. 
    Provide the response in the following JSON format:
    { 
      "oneLiner": "One plain sentence the patient can share with family — simple, accurate, reassuring", 
      "summary": "3–5 sentence plain-language explanation of the diagnosis — like talking to a friend, zero jargon", 
      "medications": [ 
        { 
          "name": "Exact medicine name from document", 
          "dosage": "Exact dose as written e.g. 500mg", 
          "frequency": "When/how often exactly as written e.g. Twice daily after meals", 
          "duration": "Number of days or as directed", 
          "purpose": "What this medicine does in one simple sentence" 
        } 
      ], 
      "warnings": [ 
        "Side effect or caution — prefix URGENT: if patient must call doctor immediately" 
      ], 
      "follow_up": [ 
        "Actionable item — tests, diet, activity, appointments from the document only" 
      ], 
      "jargonSample": "One representative jargon phrase from the document verbatim", 
      "plainSample": "That exact phrase in everyday plain language" 
    } 
      
    Rules: medications must include ALL medicines listed, never change dosage/frequency. warnings: 2–4 items. follow_up: 3–6 items. Empty array [] if no data.`;

    const userContent = [];
    if (fileData && fileType) {
      if (fileType === 'application/pdf') {
        userContent.push({ type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: fileData } });
      } else if (fileType.startsWith('image/')) {
        userContent.push({ type: 'image', source: { type: 'base64', media_type: fileType, data: fileData } });
      }
      userContent.push({ type: 'text', text: userPrompt });
    } else {
      userContent.push({ type: 'text', text: `${userPrompt}\n\nDocument:\n${text}` });
    }

    const msg = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20240620',
      max_tokens: 1500,
      system: systemPrompt,
      messages: [{ role: 'user', content: userContent }],
    });

    const raw = msg.content.map(c => c.text || '').join('');
    const clean = raw.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
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

    const anthropicMessages = messages.map(m => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.text
    }));

    const msg = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20240620',
      max_tokens: 500,
      system,
      messages: anthropicMessages,
    });

    return msg.content.map(c => c.text || '').join('').trim();
  }
};
