import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, FileText, Pill, AlertTriangle, CheckCircle2, Loader2, HeartPulse } from 'lucide-react';
import { analyzeDocument } from '../services/api';

export default function UploadAnalyzeModal({ isOpen, onClose, onAnalysisComplete }) {
  const [file, setFile] = useState(null);
  const [docType, setDocType] = useState('auto');
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const reset = () => {
    setFile(null);
    setResult(null);
    setError(null);
    setLoading(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) setFile(droppedFile);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => setDragOver(false), []);

  const handleFileSelect = (e) => {
    if (e.target.files[0]) setFile(e.target.files[0]);
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await analyzeDocument(file, docType);
      setResult(data);
      if (onAnalysisComplete) onAnalysisComplete(data);
    } catch (err) {
      setError(err.message || 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={handleClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-charcoal/80 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative bg-cream rounded-[2rem] max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-black/5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-cream/90 backdrop-blur-md z-10 px-8 pt-8 pb-4 flex justify-between items-center border-b border-black/5">
          <div>
            <span className="text-clay font-mono text-xs uppercase tracking-widest block mb-1">MedBuddy / Analyze</span>
            <h2 className="text-2xl font-serif italic text-moss">Document Intelligence</h2>
          </div>
          <button
            onClick={handleClose}
            className="w-10 h-10 rounded-full bg-white border border-black/10 flex items-center justify-center hover:bg-moss hover:text-cream transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8 space-y-8">
          {/* ── Upload Area ────────────────────── */}
          {!result && (
            <>
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`
                  border-2 border-dashed rounded-[2rem] p-12 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300
                  ${dragOver
                    ? 'border-clay bg-clay/5 scale-[1.01]'
                    : file
                      ? 'border-moss bg-moss/5'
                      : 'border-charcoal/20 hover:border-moss/50 hover:bg-moss/5'
                  }
                `}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                {file ? (
                  <>
                    <div className="w-16 h-16 rounded-full bg-moss/10 flex items-center justify-center mb-4">
                      <FileText className="w-7 h-7 text-moss" />
                    </div>
                    <p className="font-medium text-moss text-lg">{file.name}</p>
                    <p className="text-xs text-charcoal/50 mt-1 font-mono">
                      {(file.size / 1024).toFixed(1)} KB — Click to change
                    </p>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-full bg-moss/10 flex items-center justify-center mb-4">
                      <Upload className="w-7 h-7 text-clay" />
                    </div>
                    <p className="font-serif italic text-xl text-moss mb-2">Drop your document here</p>
                    <p className="text-sm text-charcoal/50">Prescription, discharge summary, or lab report</p>
                    <p className="text-xs text-charcoal/30 font-mono mt-2">PDF, JPG, PNG, WebP — Max 10MB</p>
                  </>
                )}
              </div>

              {/* Options Row */}
              <div className="flex flex-wrap gap-4 items-center justify-between">
                <div className="flex gap-3">
                  {['auto', 'prescription', 'discharge_summary', 'lab_report'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setDocType(type)}
                      className={`px-4 py-2 rounded-full text-xs font-mono uppercase tracking-wider transition-colors ${
                        docType === type
                          ? 'bg-moss text-cream'
                          : 'border border-charcoal/20 text-charcoal/60 hover:border-moss/50'
                      }`}
                    >
                      {type.replace('_', ' ')}
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleAnalyze}
                  disabled={!file || loading}
                  className={`px-8 py-3 rounded-full font-medium text-sm flex items-center gap-2 transition-all magnetic ${
                    file && !loading
                      ? 'bg-clay text-white hover:bg-clay/90 shadow-lg shadow-clay/20'
                      : 'bg-charcoal/10 text-charcoal/30 cursor-not-allowed'
                  }`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <HeartPulse className="w-4 h-4" />
                      Analyze Document
                    </>
                  )}
                </button>
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl text-sm flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                  {error}
                </div>
              )}

              {/* Loading Animation */}
              {loading && (
                <div className="bg-white rounded-[2rem] p-8 border border-black/5 text-center">
                  <div className="inline-flex items-center gap-2 text-moss font-mono text-sm mb-4">
                    <div className="w-2 h-2 rounded-full bg-clay animate-pulse" />
                    NEURAL STREAM ACTIVE
                  </div>
                  <div className="font-mono text-xs text-charcoal/50 space-y-2 text-left max-w-sm mx-auto">
                    {[
                      '> INGESTING DOCUMENT...',
                      '> EXTRACTING MEDICAL TERMINOLOGY...',
                      '> TRANSLATING TO PLAIN LANGUAGE...',
                      '> CROSS-CHECKING DRUG INTERACTIONS...',
                    ].map((line, i) => (
                      <p key={i} className="flex items-center gap-2" style={{ animationDelay: `${i * 0.5}s` }}>
                        <span className={i === 3 ? 'text-clay' : 'text-moss/60'}>{line}</span>
                        {i === 3 && <span className="w-2 h-4 bg-clay animate-pulse inline-block" />}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── Results ────────────────────────── */}
          {result && (
            <div className="space-y-6">
              {/* Summary */}
              <div className="bg-white rounded-[2rem] p-8 border border-black/5">
                <div className="flex items-center gap-2 mb-4">
                  <HeartPulse className="w-5 h-5 text-clay" />
                  <span className="font-mono text-xs uppercase tracking-widest text-charcoal/50">Plain-Language Summary</span>
                </div>
                <p className="text-charcoal/80 leading-relaxed text-lg">{result.summary}</p>
              </div>

              {/* Medications */}
              {result.medications?.length > 0 && (
                <div className="bg-white rounded-[2rem] p-8 border border-black/5">
                  <div className="flex items-center gap-2 mb-6">
                    <Pill className="w-5 h-5 text-moss" />
                    <span className="font-mono text-xs uppercase tracking-widest text-charcoal/50">Structured Medication</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b-2 border-moss/10">
                          <th className="py-3 font-mono text-xs uppercase text-charcoal/50 font-normal">Medicine</th>
                          <th className="py-3 font-mono text-xs uppercase text-charcoal/50 font-normal">Dosage</th>
                          <th className="py-3 font-mono text-xs uppercase text-charcoal/50 font-normal">Frequency</th>
                          <th className="py-3 font-mono text-xs uppercase text-charcoal/50 font-normal">Purpose</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.medications.map((med, i) => (
                          <tr key={i} className="border-b border-black/5 hover:bg-cream/50 transition-colors">
                            <td className="py-4 font-bold text-moss">{med.name}</td>
                            <td className="py-4 text-charcoal/80">{med.dosage || '—'}</td>
                            <td className="py-4 text-charcoal/80">{med.frequency || '—'}</td>
                            <td className="py-4 text-charcoal/60">{med.purpose || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Warnings */}
              {result.warnings?.length > 0 && (
                <div className="bg-white/50 backdrop-blur-sm rounded-[2rem] p-8 border border-clay/20">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle className="w-5 h-5 text-clay" />
                    <span className="font-mono text-xs uppercase tracking-widest text-charcoal/50">Side Effect Alerts</span>
                  </div>
                  <div className="space-y-3">
                    {result.warnings.map((warning, i) => (
                      <div key={i} className="border-l-2 border-clay pl-4">
                        <p className="text-sm text-charcoal/70">{warning}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Follow-ups */}
              {result.follow_up?.length > 0 && (
                <div className="bg-white rounded-[2rem] p-8 border border-black/5">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle2 className="w-5 h-5 text-clay" />
                    <span className="font-mono text-xs uppercase tracking-widest text-charcoal/50">Follow-up Protocol</span>
                  </div>
                  <ul className="space-y-3">
                    {result.follow_up.map((item, i) => (
                      <li key={i} className="flex items-start gap-3 bg-cream p-4 rounded-xl border border-black/5">
                        <CheckCircle2 className="w-4 h-4 text-clay shrink-0 mt-0.5" />
                        <span className="text-charcoal/80 text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Analyze Another */}
              <div className="flex justify-center pt-4">
                <button
                  onClick={reset}
                  className="px-8 py-3 rounded-full bg-moss text-cream font-medium text-sm flex items-center gap-2 magnetic hover:bg-moss/90 transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  Analyze Another Document
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
