import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { Calendar } from 'lucide-react';

export default function ProtocolScheduler() {
  const containerRef = useRef(null);
  const cursorRef = useRef(null);
  const timelineRef = useRef(null);
  const [activeDay, setActiveDay] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let ctx = gsap.context(() => {
      timelineRef.current = gsap.timeline({ repeat: -1, repeatDelay: 2 });
      
      // Initial state
      gsap.set(cursorRef.current, { x: 200, y: 150, opacity: 0 });
      setActiveDay(null);
      setSaved(false);

      // Move cursor in and click Wednesday (index 3)
      timelineRef.current
        .to(cursorRef.current, { opacity: 1, duration: 0.5 })
        .to(cursorRef.current, { x: 120, y: 50, duration: 1, ease: 'power2.inOut' }) // Move to Wed
        .to(cursorRef.current, { scale: 0.8, duration: 0.1 }) // Click down
        .add(() => setActiveDay(3)) // Activate day
        .to(cursorRef.current, { scale: 1, duration: 0.1 }) // Click up
        .to(cursorRef.current, { x: 50, y: 120, duration: 0.8, ease: 'power2.inOut', delay: 0.5 }) // Move to Save
        .to(cursorRef.current, { scale: 0.8, duration: 0.1 }) // Click down
        .add(() => setSaved(true))
        .to(cursorRef.current, { scale: 1, duration: 0.1 }) // Click up
        .to(cursorRef.current, { opacity: 0, duration: 0.5, delay: 0.5 }); // Fade out

    }, containerRef);

    return () => ctx.revert();
  }, []);

  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div ref={containerRef} className="bg-white rounded-[2rem] p-8 shadow-sm border border-black/5 flex flex-col h-[300px] relative overflow-hidden">
      <div className="flex justify-between items-center mb-8">
        <span className="font-mono text-xs text-charcoal/60 uppercase tracking-wider flex items-center gap-2">
          <Calendar className="w-4 h-4" /> Adaptive Regimen
        </span>
      </div>

      <div className="flex justify-between w-full mb-8 relative z-10">
        {days.map((day, i) => (
          <div 
            key={i} 
            id={`day-${i}`}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono transition-colors duration-300 ${
              activeDay === i ? 'bg-moss text-cream' : 'bg-cream text-charcoal/50'
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      <div className="mt-auto relative z-10">
        <button 
          id="btn-save"
          className={`px-6 py-2 rounded-full text-xs font-mono transition-colors duration-300 ${
            saved ? 'bg-clay text-white' : 'border border-charcoal/20 text-charcoal/60'
          }`}
        >
          {saved ? 'Protocol Saved' : 'Save Routine'}
        </button>
      </div>

      {/* SVG Cursor */}
      <div ref={cursorRef} className="absolute z-50 pointer-events-none" style={{ left: 0, top: 0 }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5.5 3.25L10.5 21.25L13.5 14.5L20.5 11.5L5.5 3.25Z" fill="#1A1A1A" stroke="#FFFFFF" strokeWidth="2" strokeLinejoin="round"/>
        </svg>
      </div>
    </div>
  );
}
