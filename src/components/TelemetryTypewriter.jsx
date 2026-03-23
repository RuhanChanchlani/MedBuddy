import React, { useEffect, useState } from 'react';
import { FileText } from 'lucide-react';

const MESSAGES = [
  "> INGESTING DISCHARGE_SUMMARY_v2.PDF",
  "> EXTRACTING DIAGNOSIS: HYPERTENSION_STAGE_2",
  "> TRANSLATING TO PLAIN_LANGUAGE...",
  "> VERIFYING MEDICATION SCHEDULE...",
  "> CROSS_CHECKING DRUG INTERACTIONS",
  "> GENERATING FOLLOW_UP PROTOCOL",
  "> SYSTEM OPTIMAL."
];

export default function TelemetryTypewriter() {
  const [lines, setLines] = useState([MESSAGES[0]]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);

  useEffect(() => {
    if (currentLineIndex >= MESSAGES.length - 1) return;

    const timer = setTimeout(() => {
      const nextIndex = currentLineIndex + 1;
      setLines(prev => {
        const newLines = [...prev, MESSAGES[nextIndex]];
        if (newLines.length > 5) newLines.shift(); // keep only last 5
        return newLines;
      });
      setCurrentLineIndex(nextIndex);
    }, Math.random() * 1500 + 1000); // Random delay between 1-2.5s

    return () => clearTimeout(timer);
  }, [currentLineIndex]);

  return (
    <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-black/5 flex flex-col h-[300px] justify-between">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-clay animate-pulse" />
          <span className="font-mono text-xs text-charcoal/60 uppercase tracking-wider">Neural Stream</span>
        </div>
        <FileText className="text-moss/40 w-5 h-5" />
      </div>
      <div className="font-mono text-charcoal space-y-3 text-xs md:text-sm flex-1 overflow-hidden flex flex-col justify-end">
        {lines.map((line, i) => (
          <p 
            key={i} 
            className={`flex items-center gap-2 ${i === lines.length - 1 ? 'text-clay' : 'text-moss/60'}`}
          >
            {line}
            {i === lines.length - 1 && currentLineIndex < MESSAGES.length - 1 && (
              <span className="w-2 h-4 bg-clay animate-pulse inline-block" />
            )}
          </p>
        ))}
      </div>
    </div>
  );
}
