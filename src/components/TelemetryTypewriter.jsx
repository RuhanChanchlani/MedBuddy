import React, { useEffect, useState } from 'react';
import { FileText } from 'lucide-react';

export default function TelemetryTypewriter({ text }) {
  const [displayText, setDisplayText] = useState('');
  const [index, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!text) return;
    setDisplayText('');
    setCurrentIndex(0);
  }, [text]);

  useEffect(() => {
    if (!text || index >= text.length) return;

    const timer = setTimeout(() => {
      setDisplayText(prev => prev + text[index]);
      setCurrentIndex(prev => prev + 1);
    }, 20);

    return () => clearTimeout(timer);
  }, [index, text]);

  return (
    <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-black/5 flex flex-col h-[300px] justify-between">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-clay animate-pulse" />
          <span className="font-mono text-xs text-charcoal/60 uppercase tracking-wider">Clinical Translation</span>
        </div>
        <FileText className="text-moss/40 w-5 h-5" />
      </div>
      <div className="font-serif italic text-charcoal text-sm md:text-base flex-1 overflow-y-auto leading-relaxed">
        {displayText}
        {text && index < text.length && (
          <span className="w-2 h-4 bg-clay animate-pulse inline-block ml-1" />
        )}
        {!text && <p className="text-charcoal/40">Waiting for clinical document input...</p>}
      </div>
    </div>
  );
}
