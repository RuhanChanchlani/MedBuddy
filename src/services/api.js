const N8N_WEBHOOK = 'https://manavn8nworkflow.app.n8n.cloud/webhook-test/d35444f7-4c65-43eb-b9cd-dd22a2b1ff49';

export async function analyzeDocument(file, docType = 'auto') {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('doc_type', docType);

  const response = await fetch(N8N_WEBHOOK, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Server error' }));
    throw new Error(error.detail || `Request failed: ${response.status}`);
  }

  const data = await response.json();

  // Normalize the response — n8n may return data in different shapes
  return {
    summary: data.summary || data.output?.summary || '',
    medications: data.medications || data.output?.medications || [],
    warnings: data.warnings || data.output?.warnings || [],
    follow_up: data.follow_up || data.output?.follow_up || [],
    original_text: data.original_text || data.output?.original_text || '',
    doc_type: data.doc_type || docType,
  };
}
