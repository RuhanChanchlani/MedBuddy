const API_BASE = 'http://localhost:8000/api/v1';

export async function analyzeDocument(file, docType = 'auto') {
  const formData = new FormData();
  formData.append('file', file);

  const url = `${API_BASE}/analyze?doc_type=${encodeURIComponent(docType)}`;

  const response = await fetch(url, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Server error' }));
    throw new Error(error.detail || `Request failed: ${response.status}`);
  }

  return response.json();
}
