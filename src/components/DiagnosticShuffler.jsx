import React, { useEffect, useState } from 'react';
import { Activity } from 'lucide-react';

export default function DiagnosticShuffler() {
  const [cards, setCards] = useState([
    { id: 1, label: 'Diagnostic Confidence', value: '98.4%', highlight: 'text-moss' },
    { id: 2, label: 'Medication Conflicts', value: 'None Detected', highlight: 'text-clay' },
    { id: 3, label: 'Priority Follow-ups', value: '2 Required', highlight: 'text-charcoal' }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCards(prev => {
        const newCards = [...prev];
        const last = newCards.pop();
        newCards.unshift(last);
        return newCards;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-black/5 h-[300px] flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute top-8 left-8 flex items-center gap-2">
         <Activity className="w-5 h-5 text-moss/40" />
         <span className="font-mono text-xs text-charcoal/60 uppercase tracking-wider">Audit Intelligence</span>
      </div>
      
      <div className="relative w-full max-w-[200px] h-[120px] mt-8">
        {cards.map((card, i) => {
          // i === 0 is the front card
          const isFront = i === 0;
          const isMiddle = i === 1;
          
          return (
            <div 
              key={card.id}
              className={`absolute top-0 left-0 w-full bg-white border border-black/10 rounded-2xl p-4 shadow-sm transition-all duration-700`}
              style={{
                transform: `translateY(${i * 12}px) scale(${1 - i * 0.05})`,
                opacity: 1 - i * 0.2,
                zIndex: 10 - i,
                transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
              }}
            >
              <div className="text-[10px] font-mono uppercase text-charcoal/50 mb-2">{card.label}</div>
              <div className={`text-xl font-serif italic ${card.highlight}`}>{card.value}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
