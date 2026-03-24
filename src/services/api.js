const BACKEND_URL = 'http://127.0.0.1:5005/api';

/**
 * Analyze a medical document using the MedBuddy backend.
 * @param {File|string} fileOrText - The file object or text to analyze.
 * @param {string} docType - auto, prescription, discharge_summary, or lab_report.
 * @param {string} lang - English, Hindi, or Gujarati.
 * @param {number} age - Patient's age.
 * @returns {Promise<object>} - The structured analysis result.
 */
export async function analyzeDocument(fileOrText, docType = 'auto', lang = 'English', age = null) {
  let payload = {
    docType,
    lang,
    age,
    text: '',
    fileData: null,
    fileType: null
  };

  if (typeof fileOrText === 'string') {
    payload.text = fileOrText;
  } else if (fileOrText && (fileOrText instanceof File || fileOrText.name)) {
    const reader = new FileReader();
    const base64Promise = new Promise((resolve, reject) => {
      reader.onload = (e) => resolve(e.target.result.split(',')[1]);
      reader.onerror = (e) => reject(new Error('Failed to read file'));
      reader.readAsDataURL(fileOrText);
    });
    payload.fileData = await base64Promise;
    payload.fileType = fileOrText.type;
  }

  const response = await fetch(`${BACKEND_URL}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Server error' }));
    throw new Error(error.error || error.detail || `Request failed: ${response.status}`);
  }

  return await response.json();
}

/**
 * Chat with the MedBuddy clinical assistant.
 * @param {Array} messages - Array of message objects {role, text}.
 * @param {string} docContext - Summary of the analyzed document for context.
 * @returns {Promise<string>} - The assistant's reply.
 */
export async function chatWithAssistant(messages, docContext) {
  const response = await fetch(`${BACKEND_URL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, docContext }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Server error' }));
    throw new Error(error.error || error.detail || `Request failed: ${response.status}`);
  }

  const data = await response.json();
  return data.reply;
}

/**
 * Authenticate a user with the MedBuddy backend.
 * @param {string} email 
 * @param {string} password 
 * @param {string} name (for signup)
 * @param {boolean} isSignup 
 * @returns {Promise<object>} - The user data.
 */
export async function authenticate(email, password, name = '', isSignup = false) {
  const endpoint = isSignup ? 'signup' : 'login';
  const response = await fetch(`${BACKEND_URL}/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Server error' }));
    throw new Error(error.error || error.detail || `Authentication failed: ${response.status}`);
  }

  return await response.json();
}
