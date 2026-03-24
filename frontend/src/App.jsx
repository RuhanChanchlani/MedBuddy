import React, { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import {
  Heart, ArrowUpRight, ChevronDown, Play, Orbit,
  FileText, Pill, AlertTriangle, CheckSquare, MessageCircle,
  Upload, Shield, Zap, Globe, Clock, Users, Lock,
  Stethoscope, Brain, Activity, Share2, LogIn, UserPlus, LogOut, Loader2,
  Check, Copy
} from "lucide-react";

const EASE = [0.16, 1, 0.3, 1];
const API_URL = window.location.hostname === "localhost" ? "http://localhost:8080" : window.location.origin;

// ─── UTILS ────────────────────────────────────────────────────────────────────
function BlurText({ text, className = "", delay = 0 }) {
  return (
    <span className={className}>
      {text}
    </span>
  );
}

function Reveal({ children, delay = 0, className = "" }) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}

// ─── AUTH COMPONENTS ──────────────────────────────────────────────────────────
function AuthModal({ type, onClose, onAuthSuccess }) {
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      if (type === "signup") {
        const res = await fetch(`${API_URL}/api/v1/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (!res.ok) throw new Error("Signup failed. User may already exist.");
        // Auto login after signup
      }

      const formBody = new URLSearchParams();
      formBody.append("username", formData.username);
      formBody.append("password", formData.password);

      const loginRes = await fetch(`${API_URL}/token`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formBody,
      });

      if (!loginRes.ok) throw new Error("Invalid credentials.");
      const data = await loginRes.json();
      localStorage.setItem("token", data.access_token);
      onAuthSuccess(data.access_token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center px-6 bg-black/60 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
        className="liquid-glass-strong w-full max-w-md p-8 rounded-3xl"
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="font-heading italic text-3xl text-white">
            {type === "login" ? "Welcome Back" : "Join MedBuddy"}
          </h2>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-white/40 uppercase tracking-widest mb-1.5 ml-1">Username</label>
            <input
              required
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-white outline-none focus:border-emerald-500/50 transition-colors"
              placeholder="johndoe"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />
          </div>
          {type === "signup" && (
            <div>
              <label className="block text-xs text-white/40 uppercase tracking-widest mb-1.5 ml-1">Email</label>
              <input
                required type="email"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-white outline-none focus:border-emerald-500/50 transition-colors"
                placeholder="john@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          )}
          <div>
            <label className="block text-xs text-white/40 uppercase tracking-widest mb-1.5 ml-1">Password</label>
            <input
              required type="password"
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-white outline-none focus:border-emerald-500/50 transition-colors"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          {error && <p className="text-red-400 text-sm ml-1">{error}</p>}

          <button
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-black rounded-2xl py-4 font-body font-600 transition-all flex items-center justify-center gap-2 mt-4"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (type === "login" ? "Sign In" : "Create Account")}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({ token }) {
  const [file, setFile] = useState(null);
  const [inputText, setInputText] = useState("");
  const [age, setAge] = useState("");
  const [language, setLanguage] = useState("English");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("file"); // 'file' | 'text'

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API_URL}/api/v1/history`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (err) {
      console.error("Failed to fetch history:", err);
    }
  };

  const handleUpload = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    
    setActiveTab("file");
    setLoading(true);
    setError("");
    setAnalysis(null);
    setInputText("");

    const formData = new FormData();
    formData.append("file", selectedFile);
    if (age) formData.append("age", age);
    formData.append("language", language);

    try {
      const res = await fetch(`${API_URL}/api/v1/analyze`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) throw new Error("Analysis failed. Please try a different file.");
      const data = await res.json();
      setAnalysis(data);
      fetchHistory(); // Refresh history
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTextAnalysis = async () => {
    if (!inputText.trim()) return;

    setLoading(true);
    setError("");
    setAnalysis(null);
    setFile(null);

    try {
      const res = await fetch(`${API_URL}/api/v1/analyze`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: inputText, age, language }),
      });
      if (!res.ok) throw new Error("Analysis failed. Please try again.");
      const data = await res.json();
      setAnalysis(data);
      fetchHistory(); // Refresh history
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
      <Reveal>
        <div className="text-center mb-16">
          <h1 className="font-heading italic text-5xl md:text-7xl text-white mb-6">Your Medical Lab</h1>
          <p className="font-body text-white/60 text-lg">Upload any medical document for an instant plain-language breakdown.</p>
        </div>
      </Reveal>

      <div className="grid lg:grid-cols-12 gap-10">
        {/* Left Column: Upload & History */}
        <div className="lg:col-span-5 space-y-8">
          {/* Upload Section */}
          <Reveal>
            <div className="liquid-glass-strong rounded-[2.5rem] p-10 border border-white/5 relative overflow-hidden group">
              <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-8">
                  <Upload className="w-8 h-8 text-emerald-400" />
                </div>
                <h3 className="font-heading italic text-3xl text-white mb-4">Analyze New Document</h3>
                <p className="font-body text-white/40 text-sm mb-6 leading-relaxed">
                  Choose a method and customize your analysis options.
                </p>

                <div className="grid grid-cols-2 gap-4 w-full mb-6">
                  <div className="flex flex-col items-start gap-2">
                    <label className="text-white/40 text-xs font-body uppercase tracking-wider">Patient Age (Optional)</label>
                    <input 
                      type="number" 
                      value={age} 
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="e.g. 25"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-emerald-500/50 transition-colors"
                    />
                  </div>
                  <div className="flex flex-col items-start gap-2">
                    <label className="text-white/40 text-xs font-body uppercase tracking-wider">Language</label>
                    <select 
                      value={language} 
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-emerald-500/50 transition-colors appearance-none cursor-pointer"
                    >
                      <option value="English" className="bg-[#02040A]">English</option>
                      <option value="Hindi" className="bg-[#02040A]">Hindi</option>
                    </select>
                  </div>
                </div>

                <div className="w-full space-y-8">
                  {/* File Upload Area */}
                  <div className="relative group/upload">
                    <div className="py-8 px-4 border-2 border-dashed border-white/5 rounded-3xl bg-white/[0.02] hover:bg-white/[0.04] hover:border-emerald-500/20 transition-all">
                      <p className="font-body text-white/30 text-[10px] mb-4 uppercase tracking-[0.2em]">Method 1: File Upload</p>
                      <label className="block w-full">
                        <input type="file" className="hidden" onChange={handleUpload} accept="image/*,.pdf,text/plain" />
                        <div className="bg-white text-black rounded-2xl py-4 px-6 font-body font-600 cursor-pointer hover:bg-emerald-50 transition-all flex items-center justify-center gap-2 shadow-xl active:scale-[0.98]">
                          {loading && activeTab === 'file' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                          <span>Select Document</span>
                        </div>
                      </label>
                      <p className="mt-4 font-body text-[10px] text-white/20 uppercase tracking-widest">PDF, JPG, PNG supported</p>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="relative py-2 flex items-center justify-center">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
                    <div className="relative px-4 bg-[#02040A] text-white/20 font-body text-[10px] uppercase tracking-[0.3em] italic">or</div>
                  </div>

                  {/* Text Input Area */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-body text-white/30 text-[10px] uppercase tracking-[0.2em]">Method 2: Paste Text</p>
                    </div>
                    <textarea
                      value={inputText}
                      onChange={(e) => {
                        setInputText(e.target.value);
                        if (e.target.value) setActiveTab("text");
                      }}
                      placeholder="Paste your medical text, prescription notes, or discharge summary here..."
                      className="w-full h-44 bg-white/[0.02] border border-white/10 rounded-3xl px-6 py-5 text-white placeholder:text-white/10 outline-none focus:border-emerald-500/30 focus:bg-white/[0.04] transition-all font-body text-sm leading-relaxed custom-scrollbar resize-none"
                    />
                    <button 
                      onClick={() => {
                        setActiveTab("text");
                        handleTextAnalysis();
                      }}
                      disabled={loading || !inputText.trim()}
                      className="w-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 rounded-2xl py-4 px-8 font-body font-600 transition-all flex items-center justify-center gap-3 disabled:opacity-20 disabled:cursor-not-allowed group/btn"
                    >
                      {loading && activeTab === 'text' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-4 h-4 fill-current group-hover/btn:scale-110 transition-transform" />}
                      <span>Analyze Medical Text</span>
                    </button>
                  </div>
                </div>
                
                {error && (
                  <div className="mt-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-body">
                    {error}
                  </div>
                )}
              </div>
            </div>
          </Reveal>

          {/* History Sidebar */}
          <Reveal delay={0.2}>
            <div className="liquid-glass rounded-[2.5rem] p-8 border border-white/5">
              <div className="flex items-center gap-3 mb-6">
                <Clock className="w-5 h-5 text-white/40" />
                <h4 className="font-heading italic text-2xl text-white">Recent History</h4>
              </div>
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {history.length === 0 ? (
                  <p className="text-white/20 font-body text-sm italic">No previous analyses yet.</p>
                ) : (
                  history.map((item, idx) => (
                    <button 
                      key={idx}
                      onClick={() => setAnalysis(item)}
                      className="w-full text-left liquid-glass-strong p-4 rounded-2xl border border-white/5 hover:border-emerald-500/30 transition-all group"
                    >
                      <p className="font-body text-white/80 font-500 mb-1 group-hover:text-emerald-400 transition-colors line-clamp-1">{item.diagnosis}</p>
                      <p className="font-body text-white/30 text-xs line-clamp-1">{item.summary}</p>
                    </button>
                  ))
                )}
              </div>
            </div>
          </Reveal>
        </div>

        {/* Results Section */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            {!analysis && !loading && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="liquid-glass rounded-[2.5rem] p-10 h-full flex flex-col items-center justify-center text-center border border-dashed border-white/10"
              >
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6">
                  <FileText className="w-6 h-6 text-white/20" />
                </div>
                <p className="font-body text-white/30 italic">Awaiting document for processing...</p>
              </motion.div>
            )}

            {loading && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="liquid-glass rounded-[2.5rem] p-10 h-full flex flex-col items-center justify-center text-center"
              >
                <Loader2 className="w-12 h-12 text-emerald-400 animate-spin mb-6" />
                <h3 className="font-heading italic text-2xl text-white mb-2">Analyzing Medical Data</h3>
                <p className="font-body text-white/40 text-sm">Parsing text and cross-referencing terminology...</p>
              </motion.div>
            )}

            {analysis && (
              <motion.div
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                className="space-y-8 pb-20"
              >
                {/* Simplified Diagnosis */}
                <div className="liquid-glass-strong rounded-[2.5rem] p-10 border border-white/5 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  <div className="flex items-center gap-4 mb-6 relative z-10">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                      <Stethoscope className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                      <span className="font-body text-[10px] text-emerald-400 tracking-[0.2em] uppercase block mb-1">Diagnosis</span>
                      <h3 className="font-heading italic text-3xl text-white">Simplified Explanation</h3>
                    </div>
                  </div>
                  <p className="font-body text-white/80 text-xl leading-relaxed relative z-10">{analysis.diagnosis_explanation}</p>
                </div>

                {/* Side-by-Side Jargon Comparison */}
                {analysis.jargon_map && analysis.jargon_map.length > 0 && (
                  <div className="liquid-glass rounded-[2.5rem] p-10 border border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                      <Zap className="w-32 h-32 text-emerald-400" />
                    </div>
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                        <Zap className="w-6 h-6 text-emerald-400" />
                      </div>
                      <div>
                        <span className="font-body text-[10px] text-emerald-400 tracking-[0.2em] uppercase block mb-1">Faithful Translation</span>
                        <h3 className="font-heading italic text-3xl text-white">Jargon vs Plain Language</h3>
                      </div>
                    </div>
                    <div className="space-y-4 relative z-10">
                      {analysis.jargon_map.map((item, idx) => (
                        <div key={idx} className="grid md:grid-cols-2 gap-4">
                          <div className="p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                            <span className="text-[10px] text-white/30 uppercase tracking-widest block mb-2 font-body font-600">Original Term</span>
                            <p className="font-body text-white/90 font-600 text-lg">{item.original}</p>
                          </div>
                          <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 hover:border-emerald-500/20 transition-colors">
                            <span className="text-[10px] text-emerald-400/50 uppercase tracking-widest block mb-2 font-body font-600">Simplified</span>
                            <p className="font-body text-emerald-50/90 text-lg">{item.simplified}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Medication Schedule Table */}
                {analysis.medication_schedule && analysis.medication_schedule.length > 0 && (
                  <div className="liquid-glass-strong rounded-[2.5rem] p-10 border border-white/5 overflow-hidden">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                        <Pill className="w-6 h-6 text-emerald-400" />
                      </div>
                      <div>
                        <span className="font-body text-[10px] text-emerald-400 tracking-[0.2em] uppercase block mb-1">Structured Schedule</span>
                        <h3 className="font-heading italic text-3xl text-white">Medication Details</h3>
                      </div>
                    </div>
                    <div className="overflow-x-auto custom-scrollbar">
                      <table className="w-full text-left font-body border-collapse min-w-[500px]">
                        <thead>
                          <tr className="border-b border-white/10">
                            <th className="py-5 text-white/40 text-[10px] uppercase tracking-widest font-600">Medicine</th>
                            <th className="py-5 text-white/40 text-[10px] uppercase tracking-widest font-600">Dosage</th>
                            <th className="py-5 text-white/40 text-[10px] uppercase tracking-widest font-600">Timing</th>
                            <th className="py-5 text-white/40 text-[10px] uppercase tracking-widest font-600 text-right">Duration</th>
                          </tr>
                        </thead>
                        <tbody className="text-white/80">
                          {analysis.medication_schedule.map((med, idx) => (
                            <tr key={idx} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                              <td className="py-5 font-600 text-emerald-400 text-lg">{med.medicine_name}</td>
                              <td className="py-5 text-white/70">{med.dosage}</td>
                              <td className="py-5 text-white/70">{med.timing}</td>
                              <td className="py-5 text-right">
                                <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-600 border border-emerald-500/20">
                                  {med.duration}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Checklist & Alerts */}
                <div className="grid md:grid-cols-2 gap-8">
                  {analysis.follow_up_checklist && analysis.follow_up_checklist.length > 0 && (
                    <div className="liquid-glass rounded-[2.5rem] p-10 border border-white/5 relative group">
                      <div className="flex items-center gap-4 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                          <CheckSquare className="w-5 h-5 text-emerald-400" />
                        </div>
                        <h4 className="font-heading italic text-2xl text-white">Follow-up Checklist</h4>
                      </div>
                      <ul className="space-y-5">
                        {analysis.follow_up_checklist.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-4 group/item">
                            <div className="w-6 h-6 rounded-lg border-2 border-emerald-500/20 flex items-center justify-center mt-0.5 group-hover/item:border-emerald-500/50 transition-colors">
                              <Check className="w-3.5 h-3.5 text-emerald-400 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                            </div>
                            <span className="font-body text-white/60 text-base leading-relaxed group-hover/item:text-white/80 transition-colors">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {analysis.side_effect_alerts && analysis.side_effect_alerts.length > 0 && (
                    <div className="liquid-glass rounded-[2.5rem] p-10 border border-red-500/10 bg-red-500/[0.01] group">
                      <div className="flex items-center gap-4 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                          <AlertTriangle className="w-5 h-5 text-red-400" />
                        </div>
                        <h4 className="font-heading italic text-2xl text-red-400">Side Effect Alerts</h4>
                      </div>
                      <ul className="space-y-5">
                        {analysis.side_effect_alerts.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-4">
                            <div className="w-2 h-2 rounded-full bg-red-400/30 mt-2.5 shrink-0 animate-pulse" />
                            <span className="font-body text-white/60 text-base leading-relaxed hover:text-white/80 transition-colors">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Family Summary */}
                <div className="liquid-glass rounded-[2.5rem] p-10 border border-emerald-500/10 bg-emerald-500/[0.02] relative group">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                        <Share2 className="w-5 h-5 text-emerald-400" />
                      </div>
                      <h4 className="font-heading italic text-2xl text-white/40">Share with Family</h4>
                    </div>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(analysis.one_line_summary);
                        // Optional: Add a toast notification here
                      }}
                      className="p-3 hover:bg-emerald-500/10 rounded-xl transition-all group/copy relative"
                      title="Copy to clipboard"
                    >
                      <Copy className="w-5 h-5 text-white/20 group-hover/copy:text-emerald-400 transition-colors" />
                    </button>
                  </div>
                  <div className="relative">
                    <span className="absolute -left-4 -top-4 text-6xl font-heading text-emerald-500/10">"</span>
                    <p className="font-body text-white/80 text-xl italic leading-relaxed pl-4 pr-4">
                      {analysis.one_line_summary}
                    </p>
                    <span className="absolute -right-4 -bottom-8 text-6xl font-heading text-emerald-500/10">"</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [authType, setAuthType] = useState(null); // 'login' | 'signup' | null

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  return (
    <div className="min-h-screen bg-[#02040A] text-white selection:bg-emerald-500/30">
      {/* Navbar */}
      <nav className="fixed top-6 left-0 right-0 z-50 px-6 lg:px-12 flex items-center justify-between">
        <div className="liquid-glass rounded-full w-11 h-11 flex items-center justify-center cursor-pointer" onClick={() => window.scrollTo(0,0)}>
          <Heart className="w-5 h-5 text-emerald-400" />
        </div>
        
        <div className="liquid-glass rounded-full px-6 py-2.5 flex items-center gap-6">
          <div className="hidden md:flex items-center gap-6">
            {["Home", "Features", "About"].map(link => (
              <a key={link} href="#" className="font-body text-sm text-white/60 hover:text-white transition-colors tracking-[0.05em]">{link}</a>
            ))}
          </div>
          
          <div className="flex items-center gap-3">
            {!token ? (
              <>
                <button 
                  onClick={() => setAuthType("login")}
                  className="text-white/60 hover:text-white font-body text-sm transition-colors flex items-center gap-2"
                >
                  <LogIn className="w-4 h-4" /> Sign In
                </button>
                <button 
                  onClick={() => setAuthType("signup")}
                  className="bg-white text-black rounded-full px-4 py-1.5 font-body text-sm font-600 flex items-center gap-1.5 hover:bg-emerald-50 transition-colors"
                >
                  <UserPlus className="w-3.5 h-3.5" /> Sign Up
                </button>
              </>
            ) : (
              <button 
                onClick={handleLogout}
                className="text-white/60 hover:text-red-400 font-body text-sm transition-colors flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Auth Modals */}
      <AnimatePresence>
        {authType && (
          <AuthModal 
            type={authType} 
            onClose={() => setAuthType(null)} 
            onAuthSuccess={(t) => { setToken(t); setAuthType(null); }} 
          />
        )}
      </AnimatePresence>

      <main>
        {token ? (
          <Dashboard token={token} />
        ) : (
          <>
            {/* Hero */}
            <section className="relative h-screen flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 z-0">
                {/* Commenting out video to check for black screen issue */}
                {/* <video autoPlay muted loop playsInline className="w-full h-full object-cover" src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260306_115329_5e00c9c5-4d69-49b7-94c3-9c31c60bb644.mp4" /> */}
                <div className="absolute inset-0 bg-[#02040A]" />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(2,4,10,0.3) 0%, rgba(2,4,10,0.85) 80%, #02040A 100%)" }} />
                <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 30%, rgba(16,185,129,0.08) 0%, transparent 70%)" }} />
              </div>

              <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
                <Reveal>
                  <div className="liquid-glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-8">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-body text-xs text-emerald-400 tracking-[0.25em] uppercase">IAR Udaan Hackathon 2026</span>
                  </div>
                </Reveal>

                <h1 className="font-heading italic text-5xl md:text-7xl lg:text-8xl text-white tracking-tight leading-[1.05] mb-6">
                  <BlurText text="The AI That Sits Between a Patient and Confusion" />
                </h1>

                <Reveal delay={0.3}>
                  <p className="font-body text-white/60 text-lg md:text-xl max-w-2xl mx-auto mb-10">
                    Join thousands of patients who use MedBuddy to simplify their prescriptions instantly.
                  </p>
                </Reveal>

                <Reveal delay={0.45}>
                  <div className="flex gap-4 justify-center">
                    <button onClick={() => setAuthType("signup")} className="liquid-glass-strong rounded-full px-8 py-4 font-body text-white font-600 text-lg hover:-translate-y-0.5 transition-transform">
                      Get Started for Free
                    </button>
                  </div>
                </Reveal>
              </div>
            </section>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 pt-20 pb-12 px-6 lg:px-12 mt-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <div className="liquid-glass rounded-full w-9 h-9 flex items-center justify-center">
              <Heart className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="font-heading italic text-xl text-white">MedBuddy</span>
          </div>
          <p className="font-body text-xs text-white/25">© 2026 MedBuddy. IAR Udaan Hackathon. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="font-body text-xs text-white/25 tracking-[0.2em] uppercase">Built for India</span>
          </div>
        </div>
      </footer>
    </div>
  );
}