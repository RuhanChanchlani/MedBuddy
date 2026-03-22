import React, { useEffect, useRef } from 'react';
import { Upload, FileText, Activity, Layers, HeartPulse, CheckCircle2, AlertTriangle } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import DiagnosticShuffler from './components/DiagnosticShuffler';
import TelemetryTypewriter from './components/TelemetryTypewriter';
import ProtocolScheduler from './components/ProtocolScheduler';

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const containerRef = useRef(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      // Intro animations
      gsap.from('.hero-text', {
        y: 100,
        opacity: 0,
        duration: 1.5,
        stagger: 0.2,
        ease: 'power4.out',
        delay: 0.2
      });
      
      gsap.from('.nav-pill', {
        y: -50,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
      });

      // Split Text Reveal
      gsap.from('.reveal-text-line', {
        scrollTrigger: {
          trigger: '.philosophy-section',
          start: 'top center',
        },
        y: 50,
        opacity: 0,
        duration: 1.2,
        stagger: 0.3,
        ease: 'power3.out'
      });

      // Stacking Archive Animation
      const cards = gsap.utils.toArray('.stack-card');
      cards.forEach((card, i) => {
        if (i === cards.length - 1) return; // Skip last card
        
        gsap.to(card, {
          scrollTrigger: {
            trigger: cards[i + 1],
            start: "top bottom",
            end: "top top",
            scrub: true,
          },
          scale: 0.9,
          filter: "blur(20px)",
          opacity: 0.5,
          y: -50
        });
      });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="relative min-h-screen bg-cream text-charcoal">
      <div className="noise-overlay" />

      {/* Floating Island Navbar */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 nav-pill w-[90%] md:w-auto">
        <div className="bg-white/60 backdrop-blur-xl border border-moss/10 px-6 py-4 rounded-[2rem] flex justify-between items-center gap-8 shadow-sm">
          <div className="font-serif italic text-xl md:text-2xl font-bold tracking-tight text-moss flex items-center gap-2">
            <Activity className="w-5 h-5 text-clay" />
            MedBuddy
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium tracking-wide">
            <a href="#intelligence" className="hover:text-moss transition-colors">Intelligence</a>
            <a href="#philosophy" className="hover:text-moss transition-colors">Philosophy</a>
            <a href="#protocol" className="hover:text-moss transition-colors">Protocol</a>
          </div>
          <button className="bg-moss text-cream px-6 py-2 rounded-full text-sm font-medium magnetic whitespace-nowrap">
            Upload Summary
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-[100dvh] flex items-end pb-20 px-4 md:px-16 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1470115636492-6d2b56f9146d?q=80&w=2070&auto=format&fit=crop"
            alt="Dark organic abstract"
            className="w-full h-full object-cover grayscale-[0.3]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-moss via-moss/80 to-transparent mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-b from-charcoal/40 to-transparent" />
        </div>

        <div className="relative z-10 max-w-5xl text-cream">
          <div className="overflow-hidden mb-2">
            <h1 className="hero-text text-4xl md:text-7xl font-sans font-bold tracking-tighter leading-none">
              Simplifying healthcare.
            </h1>
          </div>
          <div className="overflow-hidden mb-8">
            <h2 className="hero-text text-5xl md:text-9xl font-serif italic text-clay leading-none">
              Without distortion.
            </h2>
          </div>
          <p className="hero-text text-base md:text-xl text-cream/80 max-w-2xl font-light tracking-wide mb-10">
            The AI that sits between a patient and confusion. Upload your discharge summary or prescription for a clinically accurate, plain-language translation.
          </p>
          <div className="hero-text flex flex-col sm:flex-row gap-4">
            <button className="bg-white text-moss px-8 py-4 rounded-[2rem] font-medium flex items-center justify-center gap-3 magnetic">
              <Upload className="w-5 h-5" />
              Upload Document
            </button>
            <button className="border border-white/20 px-8 py-4 rounded-[2rem] hover:bg-white/5 transition-colors text-center">
              View Sample Protocol
            </button>
          </div>
        </div>
      </section>

      {/* Features: The Precision Micro-UI Dashboard */}
      <section id="intelligence" className="py-24 md:py-32 px-4 md:px-16 bg-cream">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-start">
            
            <div className="lg:col-span-4 sticky top-32">
              <span className="text-clay font-mono text-sm uppercase tracking-widest mb-4 block">01 / Intelligence</span>
              <h3 className="text-4xl lg:text-5xl font-serif italic text-moss mb-6 leading-tight">Functional<br/>Artifacts.</h3>
              <p className="text-charcoal/70 mb-8 leading-relaxed">
                Our parsing engine ingests complex medical terminology and extracts a structured, actionable telemetry feed without hallucinating medical advice.
              </p>
              
              <div className="bg-moss text-cream rounded-[2rem] p-8 flex flex-col items-center justify-center text-center mt-8 hover:bg-moss/90 transition-colors pointer-events-auto cursor-pointer border border-transparent hover:border-clay/30">
                <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-6">
                  <Upload className="w-6 h-6 text-clay -mt-1" />
                </div>
                <h4 className="font-serif italic text-2xl mb-2">Initialize Parsing</h4>
                <p className="text-sm text-cream/70 mb-6">Drag & drop prescription or discharge summary</p>
                <div className="flex gap-4 font-mono text-xs w-full justify-center">
                   <select className="bg-transparent border border-cream/20 rounded-full px-3 py-1 outline-none text-cream/70 cursor-pointer text-center">
                     <option>Age: Auto</option>
                     <option>Child</option>
                     <option>Adult</option>
                     <option>Senior</option>
                   </select>
                   <select className="bg-transparent border border-cream/20 rounded-full px-3 py-1 outline-none text-cream/70 cursor-pointer text-center">
                     <option>Lang: EN</option>
                     <option>Lang: HI</option>
                   </select>
                </div>
              </div>
            </div>

            <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <DiagnosticShuffler />
              <TelemetryTypewriter />
              <div className="md:col-span-2">
                <ProtocolScheduler />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section id="philosophy" className="philosophy-section bg-charcoal text-cream py-32 md:py-48 px-4 md:px-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <img 
             src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=2000"
             alt="texture"
             className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-charcoal mix-blend-color" />
        </div>
        
        <div className="relative z-10 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-32 items-center">
          <div>
            <div className="reveal-text-line">
              <h3 className="text-3xl md:text-5xl font-sans tracking-tight mb-2 text-white/40">
                Modern medicine asks:
              </h3>
            </div>
            <div className="reveal-text-line">
              <h3 className="text-3xl md:text-5xl font-sans tracking-tight mb-12 text-white">
                What does this jargon mean?
              </h3>
            </div>
          </div>
          <div>
            <div className="reveal-text-line">
              <h3 className="text-5xl md:text-7xl font-serif italic text-clay mb-2">
                We ask:
              </h3>
            </div>
            <div className="reveal-text-line">
              <h3 className="text-4xl md:text-6xl font-serif italic text-cream">
                What is the optimal path forward?
              </h3>
            </div>
          </div>
        </div>
      </section>

      {/* Sticky Stacking Archive (Protocol) */}
      <section id="protocol" className="relative bg-cream">
        
        {/* Card 1: Diagnosis */}
        <div className="stack-card sticky top-0 h-screen w-full bg-cream border-t border-black/5 flex items-center justify-center p-8 origin-top">
          <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="order-2 md:order-1">
               <span className="text-clay font-mono text-sm uppercase tracking-widest mb-4 block">02 / Protocol</span>
               <h2 className="text-5xl font-serif italic text-moss mb-6">Plain-Language Diagnosis.</h2>
               <p className="text-charcoal/70 text-lg leading-relaxed mb-8">
                 We eliminate the cognitive load. Complex medical conditions are translated into a conversational format, explaining precisely what is happening in your body without inducing panic.
               </p>
               <div className="bg-white p-6 rounded-[2rem] border border-black/5 flex items-start gap-4 shadow-sm">
                 <HeartPulse className="text-clay w-6 h-6 shrink-0 mt-1" />
                 <div>
                   <h4 className="font-sans font-bold text-moss mb-2">Hypertension (High Blood Pressure)</h4>
                   <p className="text-sm text-charcoal/60 leading-relaxed">
                     Your heart is currently working harder than normal to pump blood. This is manageable, and the prescribed medication will help relax your blood vessels to reduce this strain.
                   </p>
                 </div>
               </div>
            </div>
            <div className="order-1 md:order-2 flex justify-center">
               {/* Visual representation: Rotating double helix or abstract representation */}
               <div className="w-[300px] h-[300px] rounded-full border border-moss/20 flex items-center justify-center relative">
                 <div className="w-[200px] h-[200px] rounded-full border border-clay animate-spin" style={{ animationDuration: '10s' }} />
                 <div className="absolute w-[150px] h-[150px] rounded-full border border-moss border-dashed animate-spin opacity-50" style={{ animationDuration: '15s', animationDirection: 'reverse' }} />
                 <Activity className="absolute text-moss w-12 h-12" />
               </div>
            </div>
          </div>
        </div>

        {/* Card 2: Medication Table */}
        <div className="stack-card sticky top-0 h-screen w-full bg-white border-t border-black/5 flex items-center justify-center p-8 origin-top">
          <div className="max-w-6xl w-full">
            <div className="text-center mb-16">
               <span className="text-clay font-mono text-sm uppercase tracking-widest mb-4 block">03 / Regimen</span>
               <h2 className="text-5xl font-serif italic text-moss">Structured Medication.</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-moss/10">
                    <th className="py-4 font-mono text-xs uppercase text-charcoal/50 font-normal">Medicine Name</th>
                    <th className="py-4 font-mono text-xs uppercase text-charcoal/50 font-normal">Dosage</th>
                    <th className="py-4 font-mono text-xs uppercase text-charcoal/50 font-normal">Timing</th>
                    <th className="py-4 font-mono text-xs uppercase text-charcoal/50 font-normal">Duration</th>
                    <th className="py-4 font-mono text-xs uppercase text-charcoal/50 font-normal">Notes</th>
                  </tr>
                </thead>
                <tbody className="text-sm md:text-base">
                  <tr className="border-b border-black/5 hover:bg-cream/50 transition-colors">
                    <td className="py-6 font-bold text-moss flex items-center gap-3"><Layers className="w-4 h-4 text-clay"/> Lisinopril</td>
                    <td className="py-6 text-charcoal/80">10mg</td>
                    <td className="py-6 text-charcoal/80">Morning (After Breakfast)</td>
                    <td className="py-6 text-charcoal/80 font-mono">30 Days</td>
                    <td className="py-6 text-charcoal/60">Take with water to prevent dry mouth</td>
                  </tr>
                  <tr className="border-b border-black/5 hover:bg-cream/50 transition-colors">
                    <td className="py-6 font-bold text-moss flex items-center gap-3"><Layers className="w-4 h-4 text-clay"/> Atorvastatin</td>
                    <td className="py-6 text-charcoal/80">20mg</td>
                    <td className="py-6 text-charcoal/80">Night (Before Bed)</td>
                    <td className="py-6 text-charcoal/80 font-mono">90 Days</td>
                    <td className="py-6 text-charcoal/60">Avoid grapefruit juice</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Card 3: Checklists */}
        <div className="stack-card sticky top-0 h-screen w-full bg-cream border-t border-black/5 flex items-center justify-center p-8 origin-top">
          <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            <div>
               <h2 className="text-4xl font-serif italic text-moss mb-8">Follow-up Checklist.</h2>
               <ul className="space-y-4">
                 {[
                   "Schedule blood test (Lipid Panel) in 3 weeks",
                   "Monitor blood pressure daily at 9 AM",
                   "Restrict sodium intake to < 2000mg/day",
                   "Book follow-up appointment with Dr. Sharma"
                 ].map((task, i) => (
                   <li key={i} className="flex items-start gap-4 bg-white p-4 rounded-xl border border-black/5">
                     <CheckCircle2 className="w-5 h-5 text-clay shrink-0 mt-0.5" />
                     <span className="text-charcoal/80">{task}</span>
                   </li>
                 ))}
               </ul>
            </div>
            <div>
               <h2 className="text-4xl font-serif italic text-moss mb-8">Side Effect Alerts.</h2>
               <div className="bg-white/50 backdrop-blur-sm p-6 rounded-[2rem] border border-clay/20">
                 <p className="text-sm text-charcoal/60 mb-6 flex items-center gap-2 font-mono uppercase">
                   <AlertTriangle className="w-4 h-4 text-clay" /> Watch for these symptoms:
                 </p>
                 <div className="space-y-4">
                   <div className="border-l-2 border-clay pl-4">
                     <h4 className="font-bold text-moss">Persistent Dry Cough</h4>
                     <p className="text-sm text-charcoal/60">Common with Lisinopril. If it disrupts sleep, contact the doctor.</p>
                   </div>
                   <div className="border-l-2 border-clay pl-4">
                     <h4 className="font-bold text-moss">Unexplained Muscle Ache</h4>
                     <p className="text-sm text-charcoal/60">Call doctor immediately if observed alongside dark urine.</p>
                   </div>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-charcoal text-cream pt-24 pb-8 px-8 md:px-16 rounded-t-[4rem] relative z-20 -mt-[4rem] shadow-[0_-20px_50px_rgba(0,0,0,0.1)]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-24">
          <div className="md:col-span-2">
            <div className="font-serif italic text-2xl font-bold tracking-tight text-white flex items-center gap-2 mb-6">
              <Activity className="w-5 h-5 text-clay" />
              MedBuddy
            </div>
            <p className="text-white/40 max-w-sm text-sm leading-relaxed">
              Clinical intelligence simplified safely. The AI that sits between a patient and confusion.
            </p>
          </div>
          <div>
            <h4 className="font-mono text-xs uppercase tracking-widest text-white/30 mb-6">Capabilities</h4>
            <ul className="space-y-3 text-sm text-white/70">
              <li><a href="#" className="hover:text-white transition-colors">Discharge Parsing</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Prescription Translation</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Conflict Detection</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-mono text-xs uppercase tracking-widest text-white/30 mb-6">System</h4>
            <ul className="space-y-3 text-sm text-white/70">
              <li><a href="#" className="hover:text-white transition-colors">Data Privacy Protocol</a></li>
              <li><a href="#" className="hover:text-white transition-colors">API Documentation</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Clinical Guidelines</a></li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-mono text-white/30">
          <p>© 2026 MedBuddy Systems.</p>
          <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span>SYSTEM OPERATIONAL</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
