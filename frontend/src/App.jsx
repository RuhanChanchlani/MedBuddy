import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import {
  Heart, ArrowUpRight, ChevronDown, Play, Orbit,
  FileText, Pill, AlertTriangle, CheckSquare, MessageCircle,
  Upload, Shield, Zap, Globe, Clock, Users, Lock,
  Stethoscope, Brain, Activity, Share2, LogIn, UserPlus, LogOut, Loader2
} from "lucide-react";

const EASE = [0.16, 1, 0.3, 1];
const API_URL = "http://localhost:8000";

const globalStyles = `
@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Barlow:wght@300;400;500;600&display=swap');

* { box-sizing: border-box; }
body { background: #02040A; font-family: 'Barlow', sans-serif; margin: 0; color: white; }
::selection { background: rgba(16,185,129,0.3); color: white; }
.font-heading { font-family: 'Instrument Serif', serif; }
.font-body { font-family: 'Barlow', sans-serif; }

.liquid-glass {
  background: rgba(255,255,255,0.015);
  background-blend-mode: luminosity;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: none;
  box-shadow: inset 0 1px 1px rgba(255,255,255,0.1), 0 4px 24px rgba(0,0,0,0.2);
  position: relative;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.16,1,0.3,1);
}
.liquid-glass::before {
  content: ''; position: absolute; inset: 0; border-radius: inherit; padding: 1px;
  background: linear-gradient(180deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.05) 20%, rgba(255,255,255,0) 40%, rgba(255,255,255,0) 60%, rgba(255,255,255,0.05) 80%, rgba(255,255,255,0.2) 100%);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor; mask-composite: exclude; pointer-events: none;
}
.liquid-glass-strong {
  background: rgba(255,255,255,0.02);
  background-blend-mode: luminosity;
  backdrop-filter: blur(50px);
  -webkit-backdrop-filter: blur(50px);
  border: none;
  box-shadow: 0 8px 32px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.2);
  position: relative; overflow: hidden;
  transition: all 0.4s cubic-bezier(0.16,1,0.3,1);
}
.liquid-glass-strong::before {
  content: ''; position: absolute; inset: 0; border-radius: inherit; padding: 1.2px;
  background: linear-gradient(180deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.15) 20%, rgba(255,255,255,0) 40%, rgba(255,255,255,0) 60%, rgba(255,255,255,0.15) 80%, rgba(255,255,255,0.4) 100%);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor; mask-composite: exclude; pointer-events: none;
}
`;

// ─── UTILS ────────────────────────────────────────────────────────────────────
function BlurText({ text, className = "", delay = 0 }) {
  const words = text.split(" ");
  return (
    <motion.span
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={{ visible: { transition: { staggerChildren: 0.07, delayChildren: delay } } }}
      style={{ display: "flex", flexWrap: "wrap", gap: "0.25em" }}
    >
      {words.map((word, i) => (
        <motion.span
          key={i}
          variants={{
            hidden: { filter: "blur(12px)", opacity: 0, y: 40 },
            visible: { filter: "blur(0px)", opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } }
          }}
          style={{ display: "inline-block" }}
        >
          {word}
        </motion.span>
      ))}
    </motion.span>
  );
}

function Reveal({ children, delay = 0, className = "" }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 40, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.9, ease: EASE, delay }}
    >
      {children}
    </motion.div>
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
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState("");

  const handleUpload = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    
    setLoading(true);
    setError("");
    setAnalysis(null);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const res = await fetch(`${API_URL}/api/v1/analyze`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) throw new Error("Analysis failed. Please try a different file.");
      const data = await res.json();
      setAnalysis(data);
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
        {/* Upload Section */}
        <div className="lg:col-span-5">
          <Reveal>
            <div className="liquid-glass-strong rounded-[2.5rem] p-10 border border-white/5 relative overflow-hidden group">
              <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-8">
                  <Upload className="w-8 h-8 text-emerald-400" />
                </div>
                <h3 className="font-heading italic text-3xl text-white mb-4">Analyze New Document</h3>
                <p className="font-body text-white/40 text-sm mb-10 leading-relaxed">
                  PDF, JPG, or PNG. Maximum file size 10MB.<br/>Faithful extraction, no hallucinations.
                </p>
                <label className="w-full">
                  <input type="file" className="hidden" onChange={handleUpload} accept="image/*,.pdf,text/plain" />
                  <div className="bg-white text-black rounded-full py-4 px-8 font-body font-600 cursor-pointer hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Select Document"}
                  </div>
                </label>
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
                className="space-y-6"
              >
                {/* Diagnosis */}
                <div className="liquid-glass-strong rounded-3xl p-8 border border-white/5">
                  <div className="flex items-center gap-3 mb-4">
                    <Activity className="w-5 h-5 text-emerald-400" />
                    <span className="font-body text-xs text-emerald-400 tracking-widest uppercase">Diagnosis</span>
                  </div>
                  <h3 className="font-heading italic text-3xl text-white">{analysis.diagnosis}</h3>
                </div>

                {/* Medications */}
                <div className="liquid-glass-strong rounded-3xl p-8 border border-white/5 overflow-hidden">
                  <div className="flex items-center gap-3 mb-6">
                    <Pill className="w-5 h-5 text-emerald-400" />
                    <span className="font-body text-xs text-emerald-400 tracking-widest uppercase">Medication Schedule</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left font-body text-sm">
                      <thead>
                        <tr className="text-white/30 border-b border-white/5">
                          <th className="pb-4 font-500">Medicine</th>
                          <th className="pb-4 font-500">Dosage</th>
                          <th className="pb-4 font-500">Timing</th>
                          <th className="pb-4 font-500">Duration</th>
                        </tr>
                      </thead>
                      <tbody className="text-white/70">
                        {analysis.medications.map((med, i) => (
                          <tr key={i} className="border-b border-white/5">
                            <td className="py-4 font-600 text-white">{med.name}</td>
                            <td className="py-4">{med.dosage}</td>
                            <td className="py-4">{med.timing}</td>
                            <td className="py-4">{med.duration}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Side Effects & Checklist */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="liquid-glass rounded-3xl p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <AlertTriangle className="w-5 h-5 text-amber-400" />
                      <span className="font-body text-xs text-amber-400 tracking-widest uppercase">Side Effects</span>
                    </div>
                    <ul className="space-y-4">
                      {analysis.side_effects.map((se, i) => (
                        <li key={i} className="font-body text-sm text-white/60 flex gap-3">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400/50 mt-1.5 flex-shrink-0" />
                          {se}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="liquid-glass rounded-3xl p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <CheckSquare className="w-5 h-5 text-emerald-400" />
                      <span className="font-body text-xs text-emerald-400 tracking-widest uppercase">Next Steps</span>
                    </div>
                    <ul className="space-y-4">
                      {analysis.checklist.map((item, i) => (
                        <li key={i} className="font-body text-sm text-white/60 flex gap-3">
                          <div className="w-4 h-4 rounded-md border border-emerald-500/30 flex items-center justify-center mt-0.5 flex-shrink-0">
                            <div className="w-2 h-2 rounded-sm bg-emerald-400" />
                          </div>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* One Line Summary */}
                <div className="liquid-glass-strong rounded-3xl p-8 border border-emerald-500/20 bg-emerald-500/5">
                  <div className="flex items-center gap-3 mb-3">
                    <Share2 className="w-5 h-5 text-emerald-400" />
                    <span className="font-body text-xs text-emerald-400 tracking-widest uppercase">Patient Summary</span>
                  </div>
                  <p className="font-body italic text-white text-lg leading-relaxed">"{analysis.summary}"</p>
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
    <div style={{ background: "#02040A", minHeight: "100vh", color: "white" }}>
      <style dangerouslySetInnerHTML={{ __html: globalStyles }} />
      
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
                <video autoPlay muted loop playsInline className="w-full h-full object-cover" src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260306_115329_5e00c9c5-4d69-49b7-94c3-9c31c60bb644.mp4" />
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
